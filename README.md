# LUT Generator

A modern web application for creating professional color grading LUTs (.cube files) using AI, reference images, or manual controls.

## Features

- **AI-Powered Generation**: Describe your desired look in natural language and let Groq AI generate the perfect LUT
- **Image Reference**: Upload a reference image to extract color grading parameters automatically
- **Presets**: Choose from professionally designed presets (Cinematic, Vintage, Black & White, etc.)
- **Manual Controls**: Fine-tune every parameter including lift/gamma/gain color wheels
- **Universal Compatibility**: Generates industry-standard .cube files that work with all major editing software

## Supported Software

- Final Cut Pro
- Adobe Premiere Pro
- DaVinci Resolve
- After Effects
- Avid Media Composer
- LumaFusion
- And any software that supports .cube LUT files

## Tech Stack

- **Framework**: Next.js 16.0.8 (with Turbopack)
- **Styling**: Tailwind CSS v4.1
- **AI**: Groq API (llama-3.3-70b-versatile)
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd lut-generator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Add your Groq API key to `.env`:
```
GROQ_API_KEY=your_groq_api_key_here
```

Get a free API key at [console.groq.com](https://console.groq.com)

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## How to Use LUTs

### Final Cut Pro
1. Open Effects Browser
2. Search for "Custom LUT"
3. Drag effect to your clip
4. In Inspector, click LUT dropdown
5. Choose "Choose Custom LUT"
6. Select your .cube file

### Premiere Pro
1. Select your clip
2. Open Lumetri Color panel
3. Go to Creative tab
4. Click "Look" dropdown
5. Select "Browse"
6. Choose your .cube file
7. Adjust Intensity as needed

### DaVinci Resolve
1. Go to Project Settings
2. Select Color Management
3. Click "Open LUT Folder"
4. Copy .cube file there
5. Click "Update Lists"
6. In Color tab, right-click node
7. Choose LUTs → 3D LUT

### After Effects
1. Select your layer
2. Effect → Color Correction
3. Apply "Lumetri Color"
4. In Creative section
5. Click "Look" dropdown
6. Browse to .cube file

## .cube File Format

The generated LUTs use the Adobe Cube LUT Specification 1.0:
- 33x33x33 3D lookup table (35,937 color points)
- RGB values from 0.0 to 1.0
- Red-major ordering (R varies fastest)
- Compatible with all professional editing software

## License

MIT

## Credits

Built with Next.js, Tailwind CSS, and Groq AI
