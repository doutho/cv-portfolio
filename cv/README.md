# Jonathan Thomson — interactive CV

A minimal paper-style portfolio website for a fifth-year Computer Science and Engineering student at LTH, Faculty of Engineering, Lund University. Built with plain HTML, CSS, and JavaScript. No installation or build step is required.

## What is included

- Paper-style layout, numbered sections, abstract, and a responsive portrait header.
- A draggable numerical sculpture behind the introduction: a sphere morphs into a Dala horse, then a JAS Gripen aircraft as the visitor scrolls toward Projects. Scrolling up reverses the sequence. Click to pause or resume; arrow keys rotate it. Automatic motion respects reduced-motion preferences and stops when the orb is offscreen or the tab is hidden.
- A case study for Fat and Furious, a VR boss-battle course project using Unity, Blender and existing assets, with the supplied game poster. One machine learning project template uses the same short 3–5 epoch transition.
- A plain list of selected coursework, including virtual reality and applied machine learning (in progress).
- A one-page downloadable PDF CV.
- Email and GitHub links. No analytics, tracking, external scripts, or contact-form backend.

## Upload to GitHub Pages

1. Create a repository for this portfolio, or use an existing portfolio repository.
2. Upload the contents of this folder, including `index.html`, to the repository root. Do not upload the ZIP itself as the site.
3. In the repository's **Settings → Pages**, choose **Deploy from a branch**, select **main** and **/(root)**, and save.
4. Use the URL GitHub provides after the deployment completes. Share that link on LinkedIn.

The included `.nojekyll` file keeps the site as plain static files. Relative asset paths also work when the site is hosted under a repository subpath.

Reference: [GitHub's publishing-source instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Personalize the CV

- `index.html`: name, affiliation, summary, education, skills, contact details, and projects.
- `styles.css`: typography, colors, spacing, mobile layout, and print styles.
- `weight-orb.js`: the self-contained scroll-responsive canvas sculpture; the displayed numbers are illustrative rather than weights from a trained model.
- `app.js`: project transitions, navigation and copy interactions; also update the copy-email value if changing the email address.
- `Jonathan-Thomson-CV.pdf`: replace with your updated PDF when your experience changes.
- `PROJECT-TEMPLATES.md`: copyable case-study outlines.

### Replace a project template

Edit the relevant page in `projects/` and its linked row in `index.html`. Replace the title and prompts with your real project details. Change the template labels to a suitable label such as “Course project”, and remove the template notice when the case study is complete. Project links also work without JavaScript and from a GitHub Pages repository subpath. Visitors who prefer reduced motion skip the epoch animation.

Describe your individual contribution in team projects. Include measured results, evaluation methods, limitations, and links only when available. The current templates are not claims of completed projects and are intentionally excluded from the downloadable CV.

### Add LinkedIn

Add your actual profile URL beside the GitHub link in the author/contact sections. The site does not invent or guess a LinkedIn address.

## Content basis

The CV uses the background, skills, name, contact email, and plans supplied by Jonathan. LTH's English affiliation is linked to its [official website](https://www.lth.se/english/about_lth/). Graduation and thesis timing are plans. Coursework and Meta Quest 3 use were supplied by Jonathan. The game poster supplies the project title, Unity logo, team credits and course/term identifiers (MAMF45, VT26). No employment history, skill levels, grades, project achievements, or performance results have been invented.

## Typography

Headings and the name use Helvetica Neue / Helvetica with Arial as a system fallback. Body text uses the bundled Latin Modern Roman fonts, matching the Computer Modern family in the supplied LaTeX reference. Font license files are included under `fonts/`.


## Portrait

The supplied portrait is stored unchanged in `assets/jonathan-thomson.png`. The homepage uses a 208 × 260 px frame on desktop and a closer face crop using `object-fit: cover` with 1.5× zoom. The PDF uses a corresponding closer crop in its existing header frame.
