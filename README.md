# Aisha Portfolio Website

A kinetic personal portfolio website for Aisha Qiu, built as a static front-end project with animated page transitions, project showcases, narrative sections, and a visual corkboard gallery.

## Overview

This portfolio presents web development, data analysis, machine learning, and creative interface work through three main pages:

- `index.html` - landing page, skills overview, web development projects, and data / machine learning projects.
- `about.html` - narrative profile, background, technical milestones, language skills, and career direction.
- `board.html` - corkboard-style visual gallery with project images, video previews, and an off-canvas detail drawer.

The site is designed to feel editorial and interactive on desktop while also supporting a stacked mobile layout.

## Features

- Responsive mobile layout for all pages.
- Animated hero typography and scroll reveals.
- GSAP-powered desktop timeline interactions.
- Mobile-friendly stacked project cards.
- Off-canvas project detail drawer.
- Corkboard gallery with image, video, and YouTube media support.
- Custom desktop cursor interactions.
- Touch-device cursor fallback.
- Background audio control widget.

## Tech Stack

- HTML5
- CSS3
- JavaScript
- GSAP
- ScrollTrigger
- Google Fonts

No build tool or framework is required.

## Project Structure

```text
.
|-- index.html
|-- about.html
|-- board.html
|-- README.md
|-- photo/
|   |-- corkboard.png
|   |-- dekang.png
|   |-- disk.png
|   |-- ikigai.jpg
|   |-- pic1.png
|   |-- tcuoga.png
|   |-- tcuoga2.png
|   `-- yongkang.png
```

The HTML currently references media from the `photo/` folder. If the background video, audio, or emotion-detection video do not load

## Main Sections

### Home

Highlights Aisha's core skills, education, certifications, web development experience, and data / machine learning projects.

### About

Presents a longer professional narrative, including cross-cultural background, technical growth, project experience, and future direction.

### Corkboard

Provides a visual gallery of selected work and personal media, using draggable-feeling polaroid styling on desktop and stacked cards on mobile.

## Contact

Email: `11243035@gms.tcu.edu.tw`

Phone: `0903-094-745`
