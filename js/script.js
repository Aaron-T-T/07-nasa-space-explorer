// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
setupDateInputs(startInput, endInput);

// Button and gallery DOM references
const fetchBtn = document.querySelector('.filters button');
const gallery = document.getElementById('gallery');

// Your NASA API key
const NASA_API_KEY = 'zjlNUVqptKk0sDTh3P9sfCiAoLS4wSeBWv6Uc7DP';

// Helper: clear the gallery and show a placeholder message
function showMessage(message) {
    gallery.innerHTML = '';
    const placeholder = document.createElement('div');
    placeholder.className = 'placeholder';
    const icon = document.createElement('div');
    icon.className = 'placeholder-icon';
    icon.textContent = '🔭';
    const p = document.createElement('p');
    p.textContent = message;
    placeholder.appendChild(icon);
    placeholder.appendChild(p);
    gallery.appendChild(placeholder);
}

// Show a loading message while fetching images
function showLoading() {
    gallery.innerHTML = '';
    const placeholder = document.createElement('div');
    placeholder.className = 'placeholder';
    const icon = document.createElement('div');
    icon.className = 'placeholder-icon';
    icon.textContent = '⏳';
    const p = document.createElement('p');
    p.textContent = 'Loading images — please wait...';
    placeholder.appendChild(icon);
    placeholder.appendChild(p);
    gallery.appendChild(placeholder);
}

// Helper: truncate long explanations for compact cards
function truncate(text, max = 200) {
    if (!text) return '';
    return text.length > max ? text.slice(0, max) + '…' : text;
}

// Render a list of APOD items into the gallery
function renderGallery(items) {
    gallery.innerHTML = '';

    if (!items || items.length === 0) {
        showMessage('No images found for that date range. Try a different range.');
        return;
    }

    // Ensure newest items show first
    items.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'gallery-item';

        // Media: image or video
        if (item.media_type === 'image') {
            const img = document.createElement('img');
            img.src = item.url;
            img.alt = item.title || 'NASA image';
            card.appendChild(img);
        } else if (item.media_type === 'video') {
            const frame = document.createElement('iframe');
            frame.src = item.url;
            frame.title = item.title || 'NASA video';
            frame.width = '100%';
            frame.height = '200';
            frame.frameBorder = '0';
            frame.allowFullscreen = true;
            card.appendChild(frame);
        }

        // Text content: date, title, explanation
        const info = document.createElement('p');
        info.innerHTML = `<strong>${item.date || ''}</strong> — ${item.title || ''}`;
        card.appendChild(info);

        const expl = document.createElement('p');
        expl.textContent = truncate(item.explanation || '');
        card.appendChild(expl);

        gallery.appendChild(card);

        // Make each card clickable to open the modal
        card.addEventListener('click', () => {
            openModal(item);
        });
    });
}

// Fetch APOD data from NASA for the selected date range
async function fetchAPODRange() {
    const start = startInput.value;
    const end = endInput.value;

    if (!start || !end) {
        showMessage('Please choose both a start and end date.');
        return;
    }

    // Update UI to indicate loading
    fetchBtn.disabled = true;
    const originalText = fetchBtn.textContent;
    fetchBtn.textContent = 'Loading...';
    showLoading();

    const url = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}&start_date=${start}&end_date=${end}`;

    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`API error: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();

        // The API returns an object for a single day, or an array for ranges
        const items = Array.isArray(data) ? data : [data];
        renderGallery(items);
    } catch (err) {
        console.error(err);
        showMessage('Failed to fetch images. Check your network and API key.');
    } finally {
        fetchBtn.disabled = false;
        fetchBtn.textContent = originalText;
    }
}

// Modal DOM references
const modal = document.getElementById('modal');
const modalImg = modal.querySelector('.modal-image');
const modalTitle = modal.querySelector('.modal-title');
const modalDate = modal.querySelector('.modal-date');
const modalExplanation = modal.querySelector('.modal-explanation');
const modalClose = modal.querySelector('.modal-close');

// Open modal with APOD item data
function openModal(item) {
    modalImg.src = item.hdurl || item.url || '';
    modalImg.alt = item.title || 'NASA image';

    modalTitle.textContent = item.title || '';
    modalDate.textContent = item.date || '';
    modalExplanation.textContent = item.explanation || '';

    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
}

// Close modal
function closeModal() {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
}

// Close button
modalClose.addEventListener('click', closeModal);

// Close when clicking overlay
modal.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        closeModal();
    }
});

// Prevent clicks inside modal from closing it
modal.querySelector('.modal-content').addEventListener('click', (e) => {
    e.stopPropagation();
});

// Escape key closes modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// Wire up button click to start the fetch
fetchBtn.addEventListener('click', fetchAPODRange);

// Optional: fetch immediately for the default date range on load
// fetchAPODRange();
