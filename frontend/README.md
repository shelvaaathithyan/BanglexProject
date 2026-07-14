# BanglexProject Frontend (AI Bangle Size Finder)

This is the frontend application for **Banglex**, an AI-powered platform designed to help users find their perfect bangle size. By utilizing computer vision and hand-tracking AI, this application allows users to measure their hand seamlessly through their device's camera—no physical measurements or guessing required.

## ✨ Key Features

- **AI Hand Tracking**: Real-time hand analysis powered by [MediaPipe Hand Tracking](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker).
- **Interactive Size Finder**: A highly engaging UI flow that guides users to get an accurate bangle size recommendation in seconds.
- **Fluid Animations & Transitions**: Smooth and dynamic animations built with [Framer Motion](https://www.framer.com/motion/) and [GSAP](https://gsap.com/).
- **Privacy First**: Secure processing where all camera feeds are analyzed locally; no visual data is stored.
- **Data Visualizations**: Analytics components using [Recharts](https://recharts.org/).

## 🚀 Tech Stack

- **Core**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **AI/CV**: `@mediapipe/camera_utils`, `@mediapipe/hands`
- **Animations**: `framer-motion`, `gsap`
- **Charting**: `recharts`
- **Icons**: `lucide-react`, `react-icons`
- **Routing**: `react-router-dom`

## 📂 Project Structure

- `/src/components`: UI components including the `sizeFinder` module (`Hero`, `ModeStep`, `PermissionScreen`).
- `/src/pages`: Main routing views for the application.
- `/src/utils`: Utilities for computer vision and general helpers.
- `/public`: Static assets, images, and fonts.

## 🛠️ Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd BanglexProject/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Development Server

Run the following command to start the local development server:

```bash
npm run dev
```

Open the provided localhost URL (e.g., [http://localhost:5173](http://localhost:5173)) in your browser to view the application. Ensure your browser has camera permissions enabled to test the AI scanner.

### Building for Production

To create a production-ready build, run:

```bash
npm run build
```

This will output the static assets to the `/dist` directory. You can preview the production build using:

```bash
npm run preview
```

## 🤝 Contributing

When contributing to this repository, please ensure that any updates to the camera logic or UI maintain the focus on user privacy (no images are uploaded to the backend).

## 📄 License

This project is proprietary and confidential. Unauthorized copying of this file, via any medium, is strictly prohibited.
