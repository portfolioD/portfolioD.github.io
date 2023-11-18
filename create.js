const fs = require('fs');
const mustache = require('mustache');
const path = require('path');

// Function to read and return template content
const readTemplate = (filename) => fs.readFileSync(path.join(__dirname, filename), 'utf8');

// Ensure mustache.partials is an object
mustache.partials = {
  header: readTemplate('header.html'),
  footer: readTemplate('footer.html'),
  navigation: readTemplate('navigation.html'),
  section: readTemplate('section.html')
};

// Read the JSON data file
const jsonDataPath = path.join(__dirname, 'project_data.json');
const jsonData = JSON.parse(fs.readFileSync(jsonDataPath, 'utf8'));

// Create a folder to store the output HTML files
const outputFolder = path.join(__dirname, 'project-details');
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder);
}

// Define the main template
let mainTemplate = `
<!DOCTYPE html>
<html lang="en">
{{> header}}
<body id="project_details">
  <div id="project-details-section" class="container container-fluid p-0">
    <div class="row container-fluid py-3">
    <!-- Tab Navigation -->
      <div class="col-lg-3 project-tab-col">
        <div class="row container-fluid py-3">
                <div id="navbarTogglerDemo01">
                    {{> navigation}}
                </div>
            </div>
      </div>
      <div class="col-lg-9">
          <div class="tab-content section-details-tab py-3">
            {{> section}}
          </div>
      </div>
    </div>
</div>
    {{> footer}}
</body>
<script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.4/dist/umd/popper.min.js"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
<script>
</html>
`;

// Loop through each project in the JSON data
jsonData.forEach((project) => {
  const sectionsFormatted = project.Concept.sections.map((section, index) => {
    let sectionData = {
      ...section,
      id: `section${index + 1}`,
      isFirst: index === 0,
      // Initialize the HTML content as an empty string
      contentHTML: ''
    };
   // console.log("section" ,section)
    // Use a switch statement to handle different section types
    switch (section.useTemplate) {
      case "project":
        if(section.isPresent){
          sectionData.contentHTML = generateProjectHTML(project, sectionData.id);
        }
        break;
      case "floor-or-block-plans":
        if(section.isPresent){
          sectionData.contentHTML = generateFloorPlanHTML(project, sectionData.id);
        } 
        break;
      case "isometric":
        if(section.isPresent){
         sectionData.contentHTML = generateIsometricViewHTML(project, sectionData.id);
        }
        break;
      case "resource":
        if(section.isPresent){
          if (section.img) {
            console.log("image",section.img.src)
            sectionData.contentHTML = generateMaterialHTML(section , sectionData.id ,section.name);
            console.log("image sources are",section.img.src)
          }else{
            console.error(`Error: Missing material content is missing for section in project: ${project.Project}`);
          }

        }    
        break;
      case "render-in-carousel":
        if(section.isPresent){
          if (section.content && section.content.carousel) {
            sectionData.contentHTML = generateCarouselHTML(section.content.carousel ,sectionData.id ,section.name );
          } else {
            console.error(`Error: Carousel content is missing for section in project: ${project.Project}`);
          }
        }
        break;
        // ... other cases for different section types ...
      default:
        // Default handler for unexpected section types
        sectionData.contentHTML = generateDefaultSectionHTML(project, sectionData.id, section.name);
        break;
      // Add more cases for other types as needed 
    }
    
    return sectionData;
  });
 // console.log('Formatted sections:', sectionsFormatted);


 function generateProjectHTML(project, id) {
  // Check if project.highlightText is defined and not null
  let highlightTextHTML = project.highlightText ? 
      `<p class="column-details">${project.highlightText}</p>` : 
      '';

  return `
    <div class="tab-pane fade show active" id="${id}">
      <section class="container section-details">
        <h1 class="project-title">${project.Project}</h1>
        ${highlightTextHTML} <!-- Include the highlight text only if it's defined -->
        <div class="row justify-content-center">
          <div class="col-md-4 custom-column">
            <h3 class="title-border-project post-sub-title">Concept</h3>
            <p class="column-details">
              ${project.Concept.value.Description}
            </p>
          </div>
          <div class="col-md-4 custom-column">
            <h3 class="title-border-project post-sub-title">Objectives</h3>
            <ul class="column-details">
              <li><strong>Objective:</strong> ${project.Concept.value.Objective}</li>
              <li><strong>Type:</strong> ${project.Concept.value.Type}</li>
              <li><strong>Location:</strong> ${project.Concept.value.Location}</li>
              <li><strong>Area:</strong> ${project.Concept.value.Area}</li>
            </ul>
          </div>
          <div class="col-md-4 custom-column">
            <h3 class="title-border-project post-sub-title">Client Branding</h3>
            <img src="../images/client_branding_image.png" alt="Client Branding">
          </div>
        </div>
      </section>
    </div>
  `;
}

// Define the function for generating default section HTML
function generateDefaultSectionHTML(project, id, sectionName) {
  // Generate a default HTML content for an unknown section type
  // You might want to log this case or handle it accordingly
  console.warn(`Warning: No specific handler for section type '${sectionName}'. Using default rendering.`);
  return `
    <div class="tab-pane fade" id="${id}">
      <section class="container section-details">
        <h2 id="section-title" class="post-title">${sectionName}</h2>
        <p>No specific content available for this section.</p>
      </section>
    </div>
  `;
}
  


function generateIsometricViewHTML(project, id) {
  // Replace with the actual static content for the 'Isometric View' section
  return `
    <div class="tab-pane fade" id="${id}">
      <section class="container section-details">
        <h1 id="section-title" class="post-title">Isometric View</h1>
        <p>3D VIEWS - AXONOMETRIC FLOOR PLAN VIEWS</p>
        <div class="row">
          <div class="col-md-5 column-first">
            <h3 class="title-border-project post-sub-title">AXONOMETRIC VIEW - 36TH FL</h3>
            <img src="../images/Axonmetric_view_36fl.png" alt="Axonometric View - 36th Floor">
          </div>
          <div class="col-md-5 column-second">
            <h3 class="title-border-project post-sub-title">AXONOMETRIC VIEW - 37TH FL</h3>
            <img src="../images/AXONOMETRIC_VIEW _37TH_FL.png" alt="Axonometric View - 37th Floor">
          </div>
        </div>
      </section>
    </div>
  `;
}

function generateMaterialHTML(section, id ,sectionName) {
  // Replace with the actual static content for the 'Material' section
  console.log("reciveved valued",section)
  return `
    <div class="tab-pane fade" id="${id}">
      <section  id="${id}" class="container section-details">
        <h1 id="section-title" class="post-title">${sectionName}</h1>
        <img src="${section.img.src}" alt="${section.img.alt}">
      </section>
    </div>
    
  `;
}

function generateFloorPlanHTML(project, id) {
  // Replace with the actual static content for the 'Floor Plan' section
  return `
    <div class="tab-pane fade" id="${id}">
      <section class="container section-details">
        <h1 id="project-title" class="post-title">Floor Plan</h1>
        <p>This is the content of the Floor Plan section for ${project.Project}.</p>
        <img src="../images/floorplan_artizia.png" alt="Floor Plan">
        <div class="col-md-2">
          <p>This is a small column.</p>
        </div>
        <div class="col-md-5">
          <p>This is the first equal-width column.</p>
        </div>
        <div class="col-md-5">
          <p>This is the second equal-width column.</p>
        </div>
      </section>
    </div>
  `;
}

function generateCarouselHTML(carousel, sectionId , sectionName ) {
  if (!Array.isArray(carousel) || carousel.length === 0) {
      console.warn(`Carousel data is missing or incorrect`);
      return ''; // Return an empty string if carousel data is not available or empty
  }

  // Generate carousel items
  const items = carousel.map((item, index) => `
      <div class="carousel-item ${index === 0 ? 'active' : ''}"  data-interval="6000">
          <img src="${item.src}" class="d-block w-100" alt="${item.alt}">
      </div>
  `).join('');

  const itemsIndicator =  carousel.map((item, index) => `
 
      <li data-target="#carouselExample${sectionId}" data-slide-to="${index}" class="${index === 0 ? 'active' : ''}"></li>
 
`).join('');

  // Complete carousel HTML wrapped in the desired structure
  return `
      <div class="tab-pane fade" id="${sectionId}">
          <section class="container section-details">
              <h1 id="section-title" class="post-title">${sectionName}</h1>
              <div id="carouselExample${sectionId}" class="carousel slide" data-ride="carousel">
                 <ol class="carousel-indicators">
                     ${itemsIndicator}
                  </ol>
                  <div class="carousel-inner">
                      ${items}
                  </div>
                  <a class="carousel-control-prev" href="#carouselExample${sectionId}" role="button" data-slide="prev">
                      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                      <span class="sr-only">Previous</span>
                  </a>
                  <a class="carousel-control-next" href="#carouselExample${sectionId}" role="button" data-slide="next">
                      <span class="carousel-control-next-icon" aria-hidden="true"></span>
                      <span class="sr-only">Next</span>
                  </a>
              </div>
          </section>
      </div>
  `;
}





  
  // Define the placeholders for the current project
  const placeholders = {
    title: project.Project,
    Objective: project.Concept.value.Objective,
    Type: project.Concept.value.Type,
    Area: project.Concept.value.Area,
    Description: project.Concept.value.Description,
    hero_src: project.Concept.hero.src,
    hero_alt: project.Concept.hero.alt,
    sections: sectionsFormatted,
  };

  try {
    // Render the main template
    const renderedHtml = mustache.render(mainTemplate, placeholders, mustache.partials);

    // Generate the output file path
    const formattedTitle = project.Project.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/the-/g, '');
    const outputFilePath = path.join(outputFolder, `${formattedTitle}.html`);

    // Write the rendered HTML to a file
    fs.writeFileSync(outputFilePath, renderedHtml, 'utf8');
    console.log(`HTML template written for project: ${project.Project}`);
  } catch (error) {
    console.error(`Error while processing project '${project.Project}': ${error.message}`);
  }
});

console.log('All HTML templates have been processed.');
