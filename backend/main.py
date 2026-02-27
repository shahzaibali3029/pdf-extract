from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import fitz  # PyMuPDF
import io
import zipfile

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.post("/api/extract-images")
async def extract_images(file: UploadFile):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    try:
        # Read the uploaded PDF file into memory
        pdf_data = await file.read()
        pdf_document = fitz.open(stream=pdf_data, filetype="pdf")

        # Create an in-memory ZIP file
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
            for page_num in range(len(pdf_document)):
                page = pdf_document[page_num]
                image_list = page.get_images(full=True)

                for img_index, img in enumerate(image_list):
                    xref = img[0]
                    base_image = pdf_document.extract_image(xref)
                    image_bytes = base_image["image"]
                    image_ext = base_image["ext"]

                    # Attempt to preserve original image name
                    image_name = base_image.get("name")
                    if image_name:
                        # Clean up the name if it's an XObject name like 'ImX'
                        if image_name.startswith("Im") and image_name[2:].isdigit():
                            final_image_name = f"page_{page_num+1}_img_{img_index+1}.{image_ext}"
                        else:
                            final_image_name = f"{image_name}.{image_ext}"
                    else:
                        final_image_name = f"page_{page_num+1}_img_{img_index+1}.{image_ext}"

                    zip_file.writestr(final_image_name, image_bytes)

        pdf_document.close()
        zip_buffer.seek(0)

        return StreamingResponse(
            iter([zip_buffer.getvalue()]),
            media_type="application/zip",
            headers={"Content-Disposition": f"attachment; filename=extracted_images.zip"}
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {e}")

