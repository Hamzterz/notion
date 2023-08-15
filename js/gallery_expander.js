
function generateCard(id, imageUrl, title) {
    return `
        <a class="Card" onclick="openGallery(${id})" id="card-${id}">
        <div class="Card-thumb">
            <div class="Card-shadow"></div>
            <div class="Card-shadow"></div>
            <div class="Card-shadow"></div>
            <div class="Card-image" style="background-image: url(${imageUrl})"></div>
        </div>
        <div class="Card-title"><span>${title}</span></div>
        <div class="Card-explore"><span>Explore 50 more</span></div>
        <button class="Card-button">view more</button>
        </a>
    `;
}


function generateCardRow(cards) {
    return `
        <div class="Grid-row">
        ${cards.map(card => generateCard(card.id, card.imageUrls[0], card.title)).join("")}
        </div>
    `;
}


function generateGallery(id, listImagesUrls, primaryImageUrl = null) {
    const additionalRows = Math.floor((calculateImagesToGrab(listImagesUrls.length) - 3) / 3);

    // Build the additional sets of gallery images
    let additionalGalleryImages = '';
    for (let i = 1; i <= additionalRows; i++) {
        const images = listImagesUrls.slice(3 * i, 3 * i + 3).map(imageUrl => `
            <a href="${imageUrl}" target="_blank" class="Gallery-image" style="background-image: url(${imageUrl})"></a>
        `).join("");

        additionalGalleryImages += `
            <div class="Gallery-images">
                ${images}
            </div>
        `;
    }

    return `
        <section class="Gallery" id="gallery-${id}">
            <!-- This is the header of the gallery -->
            <div class="Gallery-header">
                <a class="Gallery-close" onclick="closeAll()">×</a>
            </div>
            <!-- This is the container for the gallery images -->
            <div class="Gallery-images">
                <!-- This is the left side of the gallery (optional) -->
                <div class="Gallery-left">
                    <a href="${listImagesUrls[1]}" target="_blank" class="Gallery-image" style="background-image: url(${listImagesUrls[1]})"></a>
                    <a href="${listImagesUrls[2]}" target="_blank" class="Gallery-image" style="background-image: url(${listImagesUrls[2]})"></a>
                </div>
                <!-- This is the primary (larger) gallery image -->
                <a href="${primaryImageUrl}" target="_blank" class="Gallery-image Gallery-image--primary" style="background-image: url(${primaryImageUrl})"></a>
            </div>
            ${additionalGalleryImages}
        </section>
    `;
}






function openGallery(id) {
    closeAll();
    const gallery = document.getElementById('gallery-' + id);
    const card = document.getElementById('card-' + id);
    gallery.classList.add('Gallery--active');
    card.classList.add('Card--active');
}


function closeAll() {
    const galleryActv = document.querySelector('.Gallery--active');
    const cardActv = document.querySelector('.Card--active');
    if (galleryActv) {
        galleryActv.classList.remove('Gallery--active');
    }
    if (cardActv) {
        cardActv.classList.remove('Card--active');
    }
}


// Calculate the number of images to grab based on the equation y = 3x + 6
function calculateImagesToGrab(totalImages) {
    const x = Math.floor((totalImages - 6) / 3);
    const y = 3 * x + 6;
    return y;
}


function getTripFolderNames() {
    // Update later to use an API to read all folder names inside s3 folder named trips or something
    return ['japan', 'vietnam']
}


async function getImageUrls(s3_folder) {
    try {
      const apiUrl = 'https://4ria8i1zrg.execute-api.ap-southeast-2.amazonaws.com/dev';
  
      const requestBody = {
        queryStringParameters: {
          folderPath: s3_folder
        }
      };
  
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }
  
      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error('Error fetching image URLs:', error);
      throw error;
    }
  }


/* Card Data */
// const cardsData = [
//     {
//         id: 1,
//         imageUrl: "https://d9iz9rxcn5yew.cloudfront.net/japan/osaka.jpg",
//         title: "Osaka"
//     }
// ];
let cardsData = [];
let imageUrls = [];


console.log()

// Call getImageUrls function and handle the promise resolution
//const trip = 'japan'

const trips = getTripFolderNames();


trips.forEach((trip, index) => {
    getImageUrls(trip)
    .then(data => {
        console.log('Image URLs:', data);
        const imageUrls = JSON.parse(data.body); // Assuming `data` is an array of image URLs
        const cardId = index + 1; // Add 1 to the index to avoid id collision with 0
        
        cardsData.push({
            id: cardId,
            primaryImageUrl: imageUrls[0],
            imageUrls: imageUrls,
            title: trip.charAt(0).toUpperCase() + trip.slice(1)
        });
        
        console.log(imageUrls);
        console.log(cardsData);
        
        // Now you can do something with the image URLs
        const container = document.querySelector(".Grid");
        if (cardId % 3 === 1) { // Check if it's the start of a new row
            console.log(`card index: ${index}`);
            console.log(`card id: ${cardId}`);
            container.insertAdjacentHTML("beforeend", generateCardRow(cardsData.slice(index - (index % 3), index - (index % 3) + 3)));
        }
        container.insertAdjacentHTML("beforeend", generateGallery(cardId, imageUrls, imageUrls[0]));
    })
    .catch(error => {
        console.error('Error:', error);
    });
});






console.log('Test')

// Calculate the number of images to grab
const totalImages = cardsData.length;
const imagesToGrab = calculateImagesToGrab(totalImages);


// Add event listeners for gallery close buttons
// Wait for the galleries to be inserted before adding event listeners
setTimeout(() => {
    const galleryCloseButtons = document.querySelectorAll('.Gallery-close');
    galleryCloseButtons.forEach(button => {
        button.addEventListener('click', closeAll);
    });
}, 0);
