// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);
// Button and gallery DOM references
const fetchBtn = document.querySelector('.filters button');
const gallery = document.getElementById('gallery');

// Your NASA API key (you provided this value)
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

// Wire up button click to start the fetch
fetchBtn.addEventListener('click', fetchAPODRange);

// Optional: fetch immediately for the default date range on load
// Comment this out if you prefer to wait for user interaction
// fetchAPODRange();
