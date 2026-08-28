import io
from typing import List, Dict, Any, Optional, Tuple
from PIL import Image
import numpy as np

try:
    import pytesseract
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False


class BoundingBox:
    """Represents a bounding box for detected text region"""
    def __init__(self, x: int, y: int, width: int, height: int, text: str, confidence: float):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.text = text
        self.confidence = confidence


class Annotation:
    """Represents a handwritten annotation"""
    def __init__(self, text: str, location: Tuple[int, int], confidence: float):
        self.text = text
        self.location = location
        self.confidence = confidence


class OCRResult:
    """Result of OCR processing"""
    def __init__(self, text: str, confidence: float, bounding_boxes: List[BoundingBox]):
        self.text = text
        self.confidence = confidence
        self.bounding_boxes = bounding_boxes


class OCRService:
    """Service for OCR text extraction from images"""
    
    def __init__(self):
        self.available = TESSERACT_AVAILABLE
        if not self.available:
            print("Warning: pytesseract not available. OCR functionality will be limited.")
    
    def extract_text_from_image(self, image: Image.Image, language: str = 'eng') -> str:
        """Extract text from an image using OCR"""
        if not self.available:
            return ""
        
        try:
            # Preprocess image for better OCR
            processed_image = self._preprocess_image(image)
            
            # Extract text using Tesseract
            text = pytesseract.image_to_string(processed_image, lang=language)
            
            return text.strip()
        except Exception as e:
            print(f"Error extracting text from image: {e}")
            return ""
    
    def extract_text_from_pdf_scanned(self, pdf_path: str) -> str:
        """Extract text from a scanned PDF using OCR"""
        try:
            from pdf2image import convert_from_path
            
            # Convert PDF to images
            images = convert_from_path(pdf_path)
            
            all_text = ""
            for i, image in enumerate(images):
                text = self.extract_text_from_image(image)
                all_text += f"\n--- Page {i + 1} ---\n{text}\n"
            
            return all_text
        except ImportError:
            print("pdf2image not available. Cannot process scanned PDFs.")
            return ""
        except Exception as e:
            print(f"Error processing scanned PDF: {e}")
            return ""
    
    def detect_text_regions(self, image: Image.Image) -> List[BoundingBox]:
        """Detect text regions in an image with bounding boxes"""
        if not self.available:
            return []
        
        try:
            processed_image = self._preprocess_image(image)
            
            # Get detailed OCR data with bounding boxes
            data = pytesseract.image_to_data(processed_image, output_type=pytesseract.Output.DICT)
            
            bounding_boxes = []
            n_boxes = len(data['text'])
            
            for i in range(n_boxes):
                text = data['text'][i].strip()
                confidence = int(data['conf'][i]) / 100.0
                
                if text and confidence > 0.5:  # Filter low confidence results
                    bbox = BoundingBox(
                        x=data['left'][i],
                        y=data['top'][i],
                        width=data['width'][i],
                        height=data['height'][i],
                        text=text,
                        confidence=confidence
                    )
                    bounding_boxes.append(bbox)
            
            return bounding_boxes
        except Exception as e:
            print(f"Error detecting text regions: {e}")
            return []
    
    def extract_handwritten_annotations(self, image: Image.Image) -> List[Annotation]:
        """Extract handwritten annotations from image (placeholder)"""
        # This is a placeholder - actual handwritten text recognition
        # would require specialized models like TrOCR or similar
        annotations = []
        
        # For now, return empty list as this requires advanced ML models
        return annotations
    
    def _preprocess_image(self, image: Image.Image) -> Image.Image:
        """Preprocess image for better OCR results"""
        try:
            # Convert to grayscale
            if image.mode != 'L':
                image = image.convert('L')
            
            # Apply thresholding to improve text contrast
            image_array = np.array(image)
            
            # Simple thresholding
            threshold = 128
            image_array = np.where(image_array > threshold, 255, 0)
            
            # Convert back to PIL Image
            processed_image = Image.fromarray(image_array.astype('uint8'))
            
            return processed_image
        except Exception as e:
            print(f"Error preprocessing image: {e}")
            return image
    
    def get_ocr_result_with_confidence(self, image: Image.Image, language: str = 'eng') -> OCRResult:
        """Get OCR result with confidence scores and bounding boxes"""
        if not self.available:
            return OCRResult("", 0.0, [])
        
        try:
            processed_image = self._preprocess_image(image)
            
            # Extract text
            text = pytesseract.image_to_string(processed_image, lang=language)
            
            # Get bounding boxes
            bounding_boxes = self.detect_text_regions(image)
            
            # Calculate average confidence
            avg_confidence = 0.0
            if bounding_boxes:
                avg_confidence = sum(bbox.confidence for bbox in bounding_boxes) / len(bounding_boxes)
            
            return OCRResult(text.strip(), avg_confidence, bounding_boxes)
        except Exception as e:
            print(f"Error getting OCR result: {e}")
            return OCRResult("", 0.0, [])
