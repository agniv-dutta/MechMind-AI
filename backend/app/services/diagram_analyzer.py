"""Advanced diagram understanding using computer vision (OpenCV).

Performs geometric analysis of industrial diagrams (P&ID, wiring, block,
component) to extract components, connections, labels and symbols without
requiring heavy trained object-detection weights. OCR label extraction is
attempted via Tesseract when the binary is available and degrades gracefully
otherwise.
"""

import logging
import re
from typing import Any, Dict, List, Optional, Tuple

import cv2
import numpy as np

logger = logging.getLogger(__name__)

# Geometry → component type inference for common industrial symbols.
# These fire when no OCR text is available to disambiguate a label.
SHAPE_DEFAULTS = {
    "circle": ["valve", "gauge", "sensor", "pump"],
    "ellipse": ["pump", "compressor", "motor"],
    "rectangle": ["tank", "controller", "display", "junction"],
    "diamond": ["flow_control", "junction"],
    "triangle": ["arrow", "symbol"],
    "line": ["pipe", "wire"],
}

# Label prefix → component type mapping (P&ID tag conventions).
TAG_PATTERNS = [
    (re.compile(r"^P", re.I), "pump"),
    (re.compile(r"^M", re.I), "motor"),
    (re.compile(r"^V", re.I), "valve"),
    (re.compile(r"^T-?[0-9]", re.I), "tank"),
    (re.compile(r"^C", re.I), "compressor"),
    (re.compile(r"^S|^X", re.I), "sensor"),
    (re.compile(r"^FIC|^TIC|^PIC|^LIC|^FIT|^PT|^TT|^LT", re.I), "controller"),
    (re.compile(r"^E", re.I), "heat_exchanger"),
    (re.compile(r"^F", re.I), "filter"),
]
DEFAULT_TYPE = "unknown_component"


class AdvancedDiagramAnalyzer:
    """Analyze diagrams into components, connections, labels and symbols."""

    def __init__(self):
        self.component_database = self._load_component_database()
        self._tesseract_available = self._check_tesseract()

    # ── Public API ────────────────────────────────────────────────────────
    async def analyze_diagram(self, image_path: str) -> Dict[str, Any]:
        """Comprehensive diagram analysis of an image file."""
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not load image: {image_path}")

        diagram_type = self._detect_diagram_type(image)
        labels = self._extract_labels(image)
        components = self._extract_components(image, labels)
        connections = self._extract_connections(image, components)
        symbols = self._parse_symbols(components)

        return {
            "type": diagram_type,
            "width": int(image.shape[1]),
            "height": int(image.shape[0]),
            "components": components,
            "connections": connections,
            "labels": labels,
            "symbols": symbols,
            "ocr_engine": "tesseract" if self._tesseract_available else "unavailable",
            "extracted_data": self._extract_diagram_data(
                diagram_type, components, connections
            ),
        }

    # ── Step 1: diagram type classification ───────────────────────────────
    def _detect_diagram_type(self, image: np.ndarray) -> str:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        gray = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(gray, 50, 150)

        lines = cv2.HoughLinesP(
            edges, 1, np.pi / 180, threshold=60,
            minLineLength=40, maxLineGap=8,
        )
        circles = None
        try:
            circles = cv2.HoughCircles(
                gray, cv2.HOUGH_GRADIENT, dp=1, minDist=40,
                param1=60, param2=28, minRadius=6, maxRadius=120,
            )
        except cv2.error:
            circles = None

        n_lines = len(lines) if lines is not None else 0
        n_circles = circles.shape[1] if circles is not None else 0

        if n_lines > 40 and n_circles > 0:
            return "wiring_diagram"
        if n_lines > 40:
            return "pid_diagram"
        if n_lines > 10:
            return "component_diagram"
        return "block_diagram"

    # ── Step 2: component extraction (shape analysis) ─────────────────────
    def _extract_components(
        self, image: np.ndarray, labels: List[Dict]
    ) -> List[Dict]:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        gray = cv2.GaussianBlur(gray, (5, 5), 0)
        _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

        contours, hierarchy = cv2.findContours(
            binary, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE
        )
        hierarchy = hierarchy[0]

        img_area = float(gray.shape[0] * gray.shape[1])
        min_area = max(500.0, img_area * 0.0003)

        stats = [self._contour_stats(c) for c in contours]

        # Drop contours that merely package the symbols inside them
        # (e.g. a compound blob formed by shapes bridged by pipe lines),
        # keeping the embedded symbol rings themselves.
        keep = [True] * len(contours)
        children = [0.0] * len(contours)
        for i, s in enumerate(stats):
            if s is None:
                keep[i] = False
                continue
            if s["area"] < min_area or s["aspect"] > 6.0:
                keep[i] = False
            for j, other in enumerate(stats):
                if other is None or i == j:
                    continue
                if self._contains(stats[j], s):
                    children[j] += s["area"]
        for i, s in enumerate(stats):
            if s is None or not keep[i]:
                continue
            embedded_ratio = children[i] / s["area"] if s["area"] > 0 else 0.0
            if embedded_ratio > 0.3:
                keep[i] = False
            elif s["area"] > 9000 and embedded_ratio > 0.18:
                keep[i] = False

        # Merge near-duplicate rings (nested or split symbol outlines).
        for i, a in enumerate(stats):
            if a is None or not keep[i]:
                continue
            for j in range(i + 1, len(stats)):
                b = stats[j]
                if b is None or not keep[j]:
                    continue
                if self._overlapping(a, b):
                    if a["area"] >= b["area"]:
                        keep[j] = False
                    else:
                        keep[i] = False

        components: List[Dict] = []
        for i, s in enumerate(stats):
            if not keep[i] or s is None:
                continue
            shape, confidence = self._classify_shape(contours[i], s)
            labels_near = self._labels_near(s["bbox"], labels, pad=16)
            component_type = self._infer_component_type(shape, labels_near, s)

            components.append({
                "id": f"c{len(components) + 1}",
                "type": component_type,
                "shape": shape,
                "confidence": round(confidence, 3),
                "bbox": s["bbox"],
                "center": s["center"],
                "area": int(s["area"]),
                "labels_near": labels_near,
            })

        return components

    def _contour_stats(
        self, contour: np.ndarray
    ) -> Optional[Dict[str, Any]]:
        x, y, w, h = cv2.boundingRect(contour)
        if w <= 3 and h <= 3:
            return None
        perimeter = cv2.arcLength(contour, True)
        if perimeter <= 0:
            return None
        approx = cv2.approxPolyDP(contour, 0.03 * perimeter, True)
        area = cv2.contourArea(approx)
        if area <= 0:
            return None
        return {
            "bbox": [x, y, x + w, y + h],
            "center": (x + w // 2, y + h // 2),
            "area": area,
            "vertices": len(approx),
            "perimeter": perimeter,
            "circularity": 4.0 * np.pi * area / (perimeter * perimeter),
            "fill": area / max(1.0, float(w * h)),
            "aspect": max(w, h) / max(1.0, float(min(w, h))),
        }

    def _contains(self, outer: Dict[str, Any], inner: Dict[str, Any]) -> bool:
        """True if `inner` lies fully inside `outer` with meaningful margin."""
        ox0, oy0, ox1, oy1 = outer["bbox"]
        ix0, iy0, ix1, iy1 = inner["bbox"]
        if not (ox0 <= ix0 and oy0 <= iy0 and ox1 >= ix1 and oy1 >= iy1):
            return False
        return outer["area"] > inner["area"] * 1.3

    def _overlapping(self, a: Dict[str, Any], b: Dict[str, Any]) -> bool:
        """True if two contours describe the same symbol region."""
        ax, ay = a["center"]
        bx, by = b["center"]
        a_bbox, b_bbox = a["bbox"], b["bbox"]
        sizes_match = min(a["area"], b["area"]) / max(a["area"], b["area"]) > 0.35
        min_side = min(
            a_bbox[2] - a_bbox[0], a_bbox[3] - a_bbox[1],
            b_bbox[2] - b_bbox[0], b_bbox[3] - b_bbox[1],
        )
        center_dist = np.hypot(ax - bx, ay - by)
        if sizes_match and center_dist <= max(30, min_side * 0.8):
            return True

        ix0 = max(a_bbox[0], b_bbox[0])
        iy0 = max(a_bbox[1], b_bbox[1])
        ix1 = min(a_bbox[2], b_bbox[2])
        iy1 = min(a_bbox[3], b_bbox[3])
        if ix1 <= ix0 or iy1 <= iy0:
            return False
        inter = float((ix1 - ix0) * (iy1 - iy0))
        smaller = min(a["area"], b["area"])
        return smaller > 0 and inter / smaller > 0.5

    def _classify_shape(
        self, contour: np.ndarray, s: Dict[str, Any]
    ) -> Tuple[str, float]:
        vertices = s["vertices"]
        circ = s["circularity"]
        fill = s["fill"]
        aspect = s["aspect"]

        if vertices == 3:
            return "triangle", 0.8
        if circ < 0.45 and fill < 0.6:
            return "blob", 0.4
        if fill < 0.3 and vertices > 6:
            return "blob", 0.4

        is_round = circ >= 0.55 or (vertices > 6 and circ >= 0.5)
        if is_round:
            # Square-ish rectangular rings (tanks) have 4 corners and near
            # circularity 0.785 with a compact bounding box.
            if vertices <= 5 and aspect <= 1.25 and circ >= 0.65 and fill >= 0.8:
                return "rectangle", round(min(0.8 + fill * 0.2, 1.0), 3)
            return "ellipse" if aspect >= 1.3 else "circle", round(min(max(circ, 0.6), 1.0), 3)
        if fill >= 0.45 and aspect <= 2.0:
            return "rectangle", round(min(0.55 + fill * 0.4, 0.95), 3)
        if vertices <= 6 and fill >= 0.4:
            return "rectangle", 0.55
        return "blob", 0.4

    def _infer_component_type(
        self, shape: str, labels_near: List[str], stats: Optional[Dict[str, Any]] = None
    ) -> str:
        # 1) Label tags give strongest signal (P-101 → pump, V-112 → valve…)
        for label in labels_near:
            text = (label or "").strip()
            for pattern, comp_type in TAG_PATTERNS:
                if pattern.match(text):
                    return comp_type

        # 2) Geometric context.
        area = (stats or {}).get("area", 0) or 0
        aspect = (stats or {}).get("aspect", 1) or 1
        if shape == "circle" or shape == "ellipse":
            if area > 7500 or aspect >= 1.25:
                return "pump"
            return "valve"
        if shape == "rectangle":
            aspect = max(aspect, 1.0)
            if area > 12000 and aspect <= 1.6:
                return "tank"
            return "controller" if area > 1800 else "junction"
        if shape == "triangle":
            return "symbol"
        # 3) Fall back to geometry defaults.
        candidates = SHAPE_DEFAULTS.get(shape)
        if not candidates:
            return DEFAULT_TYPE
        return candidates[0]

    # ── Step 3: connection extraction ─────────────────────────────────────
    def _extract_connections(
        self, image: np.ndarray, components: List[Dict]
    ) -> List[Dict]:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150)

        lines = cv2.HoughLinesP(
            edges, 1, np.pi / 180, threshold=60,
            minLineLength=30, maxLineGap=6,
        )
        if lines is None:
            return []

        connections: List[Dict] = []
        seen_pairs = set()

        for line in lines:
            x1, y1, x2, y2 = line[0]
            length = np.hypot(x2 - x1, y2 - y1)
            if length < 20:
                continue

            start = self._find_closest_component(components, (x1, y1))
            end = self._find_closest_component(components, (x2, y2))

            if start is None or end is None or start["id"] == end["id"]:
                continue

            pair = (start["id"], end["id"])
            if pair in seen_pairs:
                continue
            seen_pairs.add(pair)

            start_pt = np.array(start["center"], dtype=float)
            end_pt = np.array(end["center"], dtype=float)
            dist = float(np.linalg.norm(end_pt - start_pt))

            if length > dist * 6:  # line cannot span across two symbols
                continue

            connections.append({
                "id": f"l{len(connections) + 1}",
                "from": start["id"],
                "from_type": start["type"],
                "to": end["id"],
                "to_type": end["type"],
                "line_type": self._detect_line_type(image, (x1, y1, x2, y2)),
                "flow_direction": self._detect_flow_direction(
                    image, (x1, y1, x2, y2)
                ),
                "length": round(length, 1),
            })

        return connections

    def _detect_line_type(
        self, image: np.ndarray, line: Tuple[int, int, int, int]
    ) -> str:
        """Solid vs dashed line detection by sampling 'ink' gaps."""
        x1, y1, x2, y2 = line
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        _, binary = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY_INV)

        steps = 24
        gaps = 0
        for i in range(steps):
            t = i / steps
            x = int(round(x1 + (x2 - x1) * t))
            y = int(round(y1 + (y2 - y1) * t))
            x = max(0, min(gray.shape[1] - 1, x))
            y = max(0, min(gray.shape[0] - 1, y))
            if binary[y, x] == 0:
                gaps += 1

        if gaps >= 4:
            return "dashed"
        return "solid"

    def _detect_flow_direction(
        self, image: np.ndarray, line: Tuple[int, int, int, int]
    ) -> str:
        """Infer flow direction from arrowheads near line endpoints."""
        x1, y1, x2, y2 = line
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        h, w = binary.shape

        head_end = self._has_arrowhead(binary, (x1, y1), h, w)
        tail_end = self._has_arrowhead(binary, (x2, y2), h, w)

        if head_end and not tail_end:
            return "forward"
        if tail_end and not head_end:
            return "reverse"
        return "bidirectional"

    def _has_arrowhead(
        self, binary: np.ndarray, point: Tuple[int, int], h: int, w: int
    ) -> bool:
        """Detect a small filled triangle near `point` (arrowhead)."""
        px, py = point
        win = 26
        x0 = max(0, px - win)
        y0 = max(0, py - win)
        x1 = min(w - 1, px + win)
        y1 = min(h - 1, py + win)
        region = binary[y0:y1, x0:x1]
        if region.size == 0:
            return False

        contours, _ = cv2.findContours(region, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for contour in contours:
            perimeter = cv2.arcLength(contour, True)
            if perimeter <= 0:
                continue
            approx = cv2.approxPolyDP(contour, 0.05 * perimeter, True)
            if len(approx) != 3:
                continue
            area = cv2.contourArea(approx)
            if 40 <= area <= 300:
                return True
        return False

    def _find_closest_component(
        self, components: List[Dict], point: Tuple[int, int], threshold: int = 60
    ) -> Optional[Dict]:
        closest = None
        min_dist = float(threshold)
        px, py = point
        for comp in components:
            cx, cy = comp["center"]
            # Distance to component boundary (not centroid) for reliability.
            x0, y0, x1, y1 = comp["bbox"]
            dx = max(x0 - px, 0, px - x1)
            dy = max(y0 - py, 0, py - y1)
            dist = np.hypot(dx, dy)
            if dist < min_dist:
                min_dist = dist
                closest = comp
        return closest

    # ── Step 4: label extraction (optional OCR) ───────────────────────────
    def _check_tesseract(self) -> bool:
        try:
            import pytesseract

            pytesseract.get_tesseract_version()
            return True
        except Exception:
            return False

    def _extract_labels(self, image: np.ndarray) -> List[Dict]:
        if not self._tesseract_available:
            logger.debug("Tesseract not available; skipping OCR label extraction")
            return []

        try:
            import pytesseract

            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            _, processed = cv2.threshold(
                gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU
            )
            boxes = pytesseract.image_to_data(
                processed, config="--psm 11", output_type=pytesseract.Output.DICT
            )
            labels = []
            n = len(boxes["text"])
            for i in range(n):
                text = (boxes["text"][i] or "").strip()
                conf = boxes["conf"][i]
                if not text or float(conf) < 40:
                    continue
                x = boxes["left"][i]
                y = boxes["top"][i]
                w = boxes["width"][i]
                h = boxes["height"][i]
                labels.append({
                    "text": text,
                    "confidence": round(float(conf) / 100.0, 3),
                    "bbox": [x, y, x + w, y + h],
                    "position": self._estimate_position([x, y, x + w, y + h], image.shape),
                })
            return labels
        except Exception as exc:
            logger.warning("OCR label extraction failed: %s", exc)
            return []

    def _labels_near(
        self, bbox: List[int], labels: List[Dict], pad: int = 16
    ) -> List[str]:
        x0, y0, x1, y1 = bbox
        texts = []
        for label in labels:
            lx0, ly0, lx1, ly1 = label.get("bbox", [0, 0, 0, 0])
            if (
                lx1 >= x0 - pad and lx0 <= x1 + pad
                and ly1 >= y0 - pad and ly0 <= y1 + pad
            ):
                texts.append(label.get("text", ""))
        return texts

    def _estimate_position(self, bbox: List[int], image_shape) -> str:
        """Relative position of a label inside the diagram."""
        x0, y0, x1, y1 = bbox
        h, w = image_shape[:2]
        cx = (x0 + x1) / 2 / max(1, w)
        cy = (y0 + y1) / 2 / max(1, h)
        if cy < 0.33:
            return "top"
        if cy > 0.66:
            return "bottom"
        if cx < 0.33:
            return "left"
        if cx > 0.66:
            return "right"
        return "center"

    # ── Step 5: symbol / structural synthesis ─────────────────────────────
    def _parse_symbols(self, components: List[Dict]) -> Dict[str, int]:
        symbols: Dict[str, int] = {}
        for comp in components:
            comp_type = comp["type"]
            symbols[comp_type] = symbols.get(comp_type, 0) + 1
        return dict(sorted(symbols.items(), key=lambda kv: -kv[1]))

    def _extract_diagram_data(
        self,
        diagram_type: str,
        components: List[Dict],
        connections: List[Dict],
    ) -> Dict[str, Any]:
        extractors = {
            "pid_diagram": self._extract_pid_data,
            "wiring_diagram": self._extract_wiring_data,
            "component_diagram": self._extract_component_data,
            "block_diagram": self._extract_block_data,
        }
        extractor = extractors.get(diagram_type)
        return extractor(components, connections) if extractor else {}

    def _extract_pid_data(self, components, connections) -> Dict[str, Any]:
        equipment_types = {"pump", "motor", "compressor", "tank", "filter", "heat_exchanger"}
        control_types = {"valve", "controller", "flow_control"}
        measurement_types = {"sensor", "gauge"}
        return {
            "equipment": [
                c for c in components if c["type"] in equipment_types
            ],
            "controls": [c for c in components if c["type"] in control_types],
            "measurement": [
                c for c in components if c["type"] in measurement_types
            ],
            "flow_paths": connections,
            "summary": (
                f"{len(components)} components, {len(connections)} connections "
                f"({self._line_type_counts(connections)['dashed']} dashed lines)"
            ),
        }

    def _extract_wiring_data(self, components, connections) -> Dict[str, Any]:
        return {
            "electrical_components": components,
            "circuits": connections,
            "summary": f"{len(connections)} circuits detected",
        }

    def _extract_component_data(self, components, connections) -> Dict[str, Any]:
        return {
            "parts": components,
            "assemblies": connections,
            "summary": f"{len(components)} parts identified",
        }

    def _extract_block_data(self, components, connections) -> Dict[str, Any]:
        return {
            "blocks": components,
            "signal_flow": connections,
            "summary": f"{len(components)} blocks, {len(connections)} signal links",
        }

    def _line_type_counts(self, connections: List[Dict]) -> Dict[str, int]:
        counts: Dict[str, int] = {"solid": 0, "dashed": 0}
        for conn in connections:
            lt = conn.get("line_type", "solid")
            counts[lt] = counts.get(lt, 0) + 1
        return counts

    def _load_component_database(self) -> Dict[str, Dict[str, Any]]:
        return {
            "pump": {
                "symbols": ["P", "pump_icon"],
                "common_types": ["centrifugal", "gear", "piston"],
            },
            "motor": {
                "symbols": ["M", "motor_icon"],
                "common_types": ["AC", "DC", "stepper"],
            },
            "valve": {
                "symbols": ["V", "valve_icon"],
                "common_types": ["ball", "gate", "check"],
            },
            "compressor": {
                "symbols": ["C", "compressor_icon"],
                "common_types": ["centrifugal", "reciprocating", "screw"],
            },
            "tank": {
                "symbols": ["T", "tank_icon"],
                "common_types": ["storage", "buffer", "reactor"],
            },
            "sensor": {
                "symbols": ["S", "sensor_icon"],
                "common_types": ["pressure", "temperature", "level", "flow"],
            },
            "controller": {
                "symbols": ["FIC", "TIC", "controller_icon"],
                "common_types": ["PID", "PLC"],
            },
            "filter": {
                "symbols": ["F", "filter_icon"],
                "common_types": ["strainer", "cartridge"],
            },
        }