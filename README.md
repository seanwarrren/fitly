# fit.ly

A wardrobe-based outfit generator app. Users upload photos of individual clothing items, the backend removes the image background, and the user classifies each garment with metadata (type, color, formality, etc.). Saved garments can later be combined into generated outfits.

This is a class-project MVP — clean, understandable, and not overengineered.

## Tech Stack

| Layer              | Technology                                  |
| ------------------ | ------------------------------------------- |
| Frontend           | Next.js (App Router) + React + TypeScript   |
| Backend            | FastAPI + Python                            |
| Database           | MongoDB Atlas                               |
| Image Storage      | Cloudinary                                  |
| Background Removal | rembg                                       |
| Deployment         | Render (frontend + backend)                 |

## Folder Structure

```
fitly/
├── frontend/          # Next.js app
│   ├── src/
│   │   ├── app/       # App Router pages
│   │   ├── components/
│   │   └── lib/       # API helpers, constants
│   └── public/
├── backend/
│   ├── app/
│   │   ├── main.py    # FastAPI entry point
│   │   ├── routes/    # API route modules
│   │   ├── services/  # Business logic (incl. Cloudinary)
│   │   ├── models/    # Pydantic schemas
│   │   ├── db/        # MongoDB connection
│   │   └── utils/     # Helpers
├── render.yaml        # Render Blueprint (IaC)
└── README.md
```

## Architecture

- **Image ingestion is two-stage:** upload/process the image first, then save garment metadata separately.
- **Images are stored in Cloudinary.** The backend uploads both original and processed images to Cloudinary after background removal. MongoDB stores Cloudinary URLs and public IDs — no image files are stored locally or in the database.
- **No authentication yet** — a hardcoded `demo-user` userId is used where needed.
- **Route handlers are thin** — business logic lives in `services/`.

### Image Upload Pipeline

1. The frontend sends a `POST /api/upload` with an image file.
2. The backend validates the file (extension, content type, size).
3. `rembg` removes the background and produces a transparent PNG.
4. Both the original image and the processed PNG are uploaded to Cloudinary (folders: `fitly/originals` and `fitly/processed`).
5. The API returns a `fileId`, Cloudinary URLs, and public IDs.
6. The frontend displays images directly from Cloudinary URLs.

Garment metadata (type, color, formality, etc.) is saved in a **separate** step after the user classifies the garment.

---

## Running Locally

### Prerequisites

- Node.js 18+
- Python 3.10+
- A MongoDB Atlas cluster (free tier works)
- A Cloudinary account (free tier works)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API runs at **http://localhost:8000**. Check health at `GET /health`.

> **Note:** The first call to `/api/upload` will be slow (~30 s) because `rembg` downloads its ML model on first use. Subsequent uploads are fast.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at **http://localhost:3000**.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable                 | Description                          | Example                                                                 |
| ------------------------ | ------------------------------------ | ----------------------------------------------------------------------- |
| `MONGO_URI`              | MongoDB Atlas connection string      | `mongodb+srv://user:pass@cluster.mongodb.net/?appName=fitly`            |
| `FRONTEND_URL`           | Deployed frontend URL (for CORS)     | `https://fitly-frontend.onrender.com`                                   |
| `CLOUDINARY_CLOUD_NAME`  | Cloudinary cloud name                | `dxxxxxxxxx`                                                            |
| `CLOUDINARY_API_KEY`     | Cloudinary API key                   | `123456789012345`                                                       |
| `CLOUDINARY_API_SECRET`  | Cloudinary API secret                | `aBcDeFgHiJkLmNoPqRsTuVwXyZ`                                           |

### Frontend (`frontend/.env.local`)

| Variable                   | Description                      | Example                                                 |
| -------------------------- | -------------------------------- | ------------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | Deployed backend URL             | `https://fitly-backend.onrender.com`                    |

For local development, use:

```
# backend/.env
MONGO_URI=mongodb+srv://...
FRONTEND_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# frontend/.env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

---

## Deploying on Render

This project is configured for deployment on [Render](https://render.com) using GitHub-based continuous deployment. Both the backend and frontend are deployed as separate **Web Services** in the same Render dashboard.

### Option A: One-Click Deploy with Blueprint

The repo includes a `render.yaml` Blueprint file. To use it:

1. Push this repo to GitHub.
2. Go to the [Render Dashboard](https://dashboard.render.com).
3. Click **New** → **Blueprint**.
4. Connect your GitHub repo.
5. Render will detect `render.yaml` and create both services.
6. Set the required environment variables for each service (see below).
7. Deploy.

### Option B: Manual Setup

#### Deploy the Backend

1. In the Render Dashboard, click **New** → **Web Service**.
2. Connect your GitHub repository.
3. Configure:

| Setting         | Value                                               |
| --------------- | --------------------------------------------------- |
| **Name**        | `fitly-backend`                                     |
| **Root Dir**    | `backend`                                           |
| **Runtime**     | Python                                              |
| **Build Cmd**   | `pip install -r requirements.txt`                   |
| **Start Cmd**   | `uvicorn app.main:app --host 0.0.0.0 --port $PORT`  |

4. Add environment variables:

| Key                       | Value                                                    |
| ------------------------- | -------------------------------------------------------- |
| `MONGO_URI`               | Your MongoDB Atlas connection string                     |
| `FRONTEND_URL`            | `https://fitly-frontend.onrender.com` (your frontend URL)|
| `CLOUDINARY_CLOUD_NAME`   | Your Cloudinary cloud name                               |
| `CLOUDINARY_API_KEY`      | Your Cloudinary API key                                  |
| `CLOUDINARY_API_SECRET`   | Your Cloudinary API secret                               |
| `PYTHON_VERSION`          | `3.12.3`                                                 |

5. Click **Create Web Service**.

#### Deploy the Frontend

1. Click **New** → **Web Service**.
2. Connect the same GitHub repository.
3. Configure:

| Setting         | Value                               |
| --------------- | ----------------------------------- |
| **Name**        | `fitly-frontend`                    |
| **Root Dir**    | `frontend`                          |
| **Runtime**     | Node                                |
| **Build Cmd**   | `npm install && npm run build`      |
| **Start Cmd**   | `npm run start -- -p $PORT`         |

4. Add environment variables:

| Key                        | Value                                        |
| -------------------------- | -------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | `https://fitly-backend.onrender.com`         |
| `NODE_VERSION`             | `20.11.1`                                    |

5. Click **Create Web Service**.

### After Deploying

- **Auto-deploy:** Render automatically deploys on every push to the connected branch (usually `main`).
- **Update env vars:** If your Render URLs differ from the examples above, update `FRONTEND_URL` on the backend and `NEXT_PUBLIC_API_BASE_URL` on the frontend to match.
- **First upload will be slow:** The `rembg` ML model (~170 MB) is downloaded on the first `/api/upload` call. Subsequent uploads are fast.

### MongoDB Atlas

MongoDB Atlas runs independently of Render:

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a database user with read/write access.
3. Whitelist `0.0.0.0/0` in **Network Access** so Render can connect (or whitelist Render's static IPs if available).
4. Copy the connection string and set it as `MONGO_URI` in the backend environment variables.

### Cloudinary

1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. From your Cloudinary dashboard, copy your **Cloud Name**, **API Key**, and **API Secret**.
3. Set them as environment variables in the backend (both locally in `.env` and on Render).

---

## Testing the API

### Upload an image

```bash
curl -X POST http://localhost:8000/api/upload/ \
  -F "file=@/path/to/your/image.jpg"
```

Response:

```json
{
  "success": true,
  "fileId": "a1b2c3d4...",
  "originalImageUrl": "https://res.cloudinary.com/.../fitly/originals/a1b2c3d4.jpg",
  "processedImageUrl": "https://res.cloudinary.com/.../fitly/processed/a1b2c3d4.png"
}
```

### Save garment metadata

```bash
curl -X POST http://localhost:8000/api/garments/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Navy T-Shirt",
    "category": "tops",
    "garmentType": "t-shirt",
    "primaryColor": "navy",
    "formality": "casual",
    "thickness": "light",
    "pattern": "solid",
    "weatherSuitability": ["warm", "hot"],
    "notes": "Favorite summer shirt",
    "originalImageUrl": "https://res.cloudinary.com/.../fitly/originals/a1b2c3d4.jpg",
    "processedImageUrl": "https://res.cloudinary.com/.../fitly/processed/a1b2c3d4.png"
  }'
```

### List garments

```bash
curl http://localhost:8000/api/garments/demo-user
```

### Delete a garment

```bash
curl -X DELETE http://localhost:8000/api/garments/<garment-id>
```

---

## Known MVP Limitations

| Limitation                        | Detail                                                                                           |
| --------------------------------- | ------------------------------------------------------------------------------------------------ |
| **No authentication**             | A hardcoded `demo-user` userId is used everywhere. There is no login, signup, or session management. |
| **Rule-based outfit generation**  | Outfit generation uses simple keyword-matching rules, not an LLM. It matches garment metadata against weather/occasion cues extracted from the prompt. |
| **No image editing**              | There is no cropping, rotation, or manual background editing after upload. |
| **Single user**                   | The app only supports one user (`demo-user`). Multi-user support requires authentication. |
