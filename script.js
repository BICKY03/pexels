// Your Pexels API key
const API_KEY = 'VZtj34E0cG37YTeyA5oLw2fW1NpymV0ag6xWP1pZcOEgoGZ39f9bKI2c';
const similarProductsList = document.getElementById('similar-products-list');
const favouritesList = document.getElementById('favourites-list');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const featuredImage = document.getElementById('featured-image');
const photographerLink = document.getElementById('photographer-link');
const API_URL = 'https://api.pexels.com/v1/search';

// Initialize Splide carousels
const similarProductsCarousel = new Splide('#similar-products-carousel', {
    type       : 'loop',
    perPage    : 3,
    gap        : '10px',
    pagination : false,
    arrows     : true,
}).mount();

const favouritesCarousel = new Splide('#favourites-carousel', {
    perPage    : 3,
    gap        : '10px',
    pagination : false,
    arrows     : true,
}).mount();

// Function to fetch photos from Pexels API
const fetchPhotos = (query) => {
    fetch(`${API_URL}?query=${query}&per_page=10`, {
        headers: {
            Authorization: API_KEY
        }
    })
    .then(response => response.json())
    .then(data => {
        similarProductsList.innerHTML = ''; // Clear previous images
        if (data.photos.length > 0) {
            const firstPhoto = data.photos[0];
            featuredImage.src = firstPhoto.src.large;
            photographerLink.href = firstPhoto.photographer_url;
            photographerLink.textContent = `View ${firstPhoto.photographer}'s Profile`;
        }
        data.photos.forEach(photo => {
            const li = document.createElement('li');
            li.className = 'splide__slide';

            const img = document.createElement('img');
            img.src = photo.src.medium;
            img.alt = photo.photographer;
            img.className = 'photo-img';

            const loveSign = document.createElement('span');
            loveSign.textContent = '❤️';
            loveSign.className = 'love-sign';

            loveSign.addEventListener('click', () => {
                if (loveSign.classList.contains('loved')) {
                    loveSign.classList.remove('loved');
                    removeFromFavourites(photo.src.medium);
                } else {
                    loveSign.classList.add('loved');
                    addToFavourites(photo);
                }
            });

            const title = document.createElement('p');
            title.className = 'photo-title';
            title.textContent = photo.photographer; // Add photographer's name as title

            li.appendChild(img);
            li.appendChild(loveSign);
            li.appendChild(title);
            similarProductsList.appendChild(li);
        });

        similarProductsCarousel.refresh();
    })
    .catch(error => console.error('Error fetching data:', error));
};

// Function to add photo to favourites list
const addToFavourites = (photo) => {
    const existingImages = Array.from(favouritesList.querySelectorAll('img')).map(img => img.src);
    if (!existingImages.includes(photo.src.medium)) {
        const li = document.createElement('li');
        li.className = 'splide__slide';

        const img = document.createElement('img');
        img.src = photo.src.medium;
        img.className = 'photo-img';

        const loveSign = document.createElement('span');
        loveSign.textContent = '❤️';
        loveSign.className = 'love-sign loved';

        loveSign.addEventListener('click', () => {
            loveSign.classList.remove('loved');
            removeFromFavourites(photo.src.medium);
        });

        const title = document.createElement('p');
        title.className = 'photo-title';
        title.textContent = photo.photographer; // Add photographer's name as title

        li.appendChild(img);
        li.appendChild(loveSign);
        li.appendChild(title);
        favouritesList.appendChild(li);

        // Save to session storage
        saveToSessionStorage(photo);

        favouritesCarousel.refresh();
    }
};

// Function to remove photo from favourites list
const removeFromFavourites = (src) => {
    const images = favouritesList.querySelectorAll('img');
    images.forEach(img => {
        if (img.src === src) {
            img.parentElement.remove();
            removeFromSessionStorage(src);
        }
    });
    favouritesCarousel.refresh();
};

// Save favourites to session storage
const saveToSessionStorage = (photo) => {
    let favourites = JSON.parse(sessionStorage.getItem('favourites')) || [];
    favourites.push(photo);
    sessionStorage.setItem('favourites', JSON.stringify(favourites));
};

// Remove favourites from session storage
const removeFromSessionStorage = (src) => {
    let favourites = JSON.parse(sessionStorage.getItem('favourites')) || [];
    favourites = favourites.filter(fav => fav.src.medium !== src);
    sessionStorage.setItem('favourites', JSON.stringify(favourites));
};

// Load favourites from session storage
const loadFavouritesFromSessionStorage = () => {
    const favourites = JSON.parse(sessionStorage.getItem('favourites')) || [];
    favourites.forEach(photo => addToFavourites(photo));
};

// Load favourites on page load
window.addEventListener('load', loadFavouritesFromSessionStorage);

// Function to sort favourites by title
const sortFavouritesByTitle = () => {
    const items = Array.from(favouritesList.querySelectorAll('li'));
    items.sort((a, b) => {
        const titleA = a.querySelector('.photo-title').textContent.toUpperCase();
        const titleB = b.querySelector('.photo-title').textContent.toUpperCase();
        return titleA.localeCompare(titleB);
    });

    // Clear existing list and append sorted items
    favouritesList.innerHTML = '';
    items.forEach(item => favouritesList.appendChild(item));

    favouritesCarousel.refresh();
};

// Event listener for sort button
document.getElementById('sort-button').addEventListener('click', sortFavouritesByTitle);

// Event listener for search button
searchButton.addEventListener('click', () => {
    fetchPhotos(searchInput.value);
});

// Initial fetch to populate similar products
fetchPhotos('nature'); // Replace 'nature' with any default query


