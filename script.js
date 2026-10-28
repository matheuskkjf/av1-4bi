const STORAGE_KEY = "frame-catalog-v1";

const initialTitles = [
	{ id: "sample-1", title: "Interestelar", category: "Filme", year: 2014, description: "Uma jornada além das estrelas para salvar o futuro da humanidade.", favorite: true, rating: "8,7" },
	{ id: "sample-2", title: "Arcane", category: "Série", year: 2021, description: "Duas irmãs em lados opostos de uma cidade dividida pela tecnologia.", favorite: false, rating: "9,0" },
	{ id: "sample-3", title: "Horizon Forbidden West", category: "Jogo", year: 2022, description: "Explore um mundo exuberante e misterioso em uma aventura épica.", favorite: false, rating: "8,5" },
	{ id: "sample-4", title: "Duna: Parte Dois", category: "Filme", year: 2024, description: "Paul Atreides se une aos fremen em uma jornada pelo deserto.", favorite: true, rating: "8,6" },
	{ id: "sample-5", title: "The Last of Us", category: "Série", year: 2023, description: "Em um mundo transformado, duas vidas se cruzam em uma viagem perigosa.", favorite: false, rating: "8,8" },
	{ id: "sample-6", title: "Stardew Valley", category: "Jogo", year: 2016, description: "Recomece a vida no campo e descubra os segredos do vale.", favorite: true, rating: "8,9" },
	{ id: "sample-7", title: "Tudo em Todo o Lugar", category: "Filme", year: 2022, description: "Uma aventura surpreendente através de possibilidades infinitas.", favorite: false, rating: "7,8" },
	{ id: "sample-8", title: "The Bear", category: "Série", year: 2022, description: "Um jovem chef volta para casa e tenta transformar o restaurante da família.", favorite: false, rating: "8,6" }
];

const catalogGrid = document.querySelector("#catalogGrid");
const searchInput = document.querySelector("#searchInput");
const categoryFilter = document.querySelector("#categoryFilter");
const favoritesFilter = document.querySelector("#favoritesFilter");
const navFavorites = document.querySelector("#navFavorites");
const resultCount = document.querySelector("#resultCount");
const navFavCount = document.querySelector("#navFavCount");
const emptyState = document.querySelector("#emptyState");
const titleForm = document.querySelector("#titleForm");
const feedback = document.querySelector("#feedback");

let titles = loadTitles();
let favoritesOnly = false;
let feedbackTimeout;

function loadTitles() {
	try {
		const savedTitles = JSON.parse(localStorage.getItem(STORAGE_KEY));
		if (Array.isArray(savedTitles)) return savedTitles;
	} catch (error) {
		console.warn("Não foi possível carregar a coleção salva.", error);
	}
	return [...initialTitles];
}

function saveTitles() {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(titles));
	} catch (error) {
		showFeedback("Não foi possível salvar neste navegador. A coleção ficará disponível até você fechar a página.", "error");
		console.warn("Não foi possível salvar a coleção.", error);
	}
}

function escapeHTML(value) {
	return String(value).replace(/[&<>"']/g, (character) => ({
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': "&quot;",
		"'": "&#39;"
	})[character]);
}

function getCategoryIcon(category) {
	const icons = { Filme: "bi-film", Série: "bi-tv", Jogo: "bi-controller" };
	return icons[category] || "bi-stars";
}

function getVisibleTitles() {
	const query = searchInput.value.trim().toLocaleLowerCase("pt-BR");
	const category = categoryFilter.value;

	return titles.filter((item) => {
		const matchesText = `${item.title} ${item.description}`.toLocaleLowerCase("pt-BR").includes(query);
		const matchesCategory = category === "Todos" || item.category === category;
		const matchesFavorite = !favoritesOnly || item.favorite;
		return matchesText && matchesCategory && matchesFavorite;
	});
}

function createCard(item, index) {
	const safeTitle = escapeHTML(item.title);
	const safeCategory = escapeHTML(item.category);
	const safeDescription = escapeHTML(item.description);
	const favoriteClass = item.favorite ? "is-favorite" : "";
	const favoriteIcon = item.favorite ? "bi-heart-fill" : "bi-heart";
	const rating = item.rating ? `<span class="rating"><i class="bi bi-star-fill me-1"></i>${escapeHTML(item.rating)}</span>` : "<span>Minha coleção</span>";

	return `
		<div class="col-12 col-sm-6 col-lg-4 catalog-grid-col">
			<article class="catalog-card">
				<div class="poster poster-tone-${index % 6}">
					<i class="poster-symbol bi ${getCategoryIcon(item.category)}" aria-hidden="true"></i>
					<div class="poster-topline">
						<span class="category-pill">${safeCategory}</span>
						<button class="favorite-btn ${favoriteClass}" type="button" data-action="favorite" data-id="${escapeHTML(item.id)}" aria-label="${item.favorite ? "Remover" : "Adicionar"} ${safeTitle} ${item.favorite ? "dos" : "aos"} favoritos" aria-pressed="${item.favorite}">
							<i class="bi ${favoriteIcon}" aria-hidden="true"></i>
						</button>
					</div>
					<h3 class="poster-title">${safeTitle}</h3>
				</div>
				<div class="card-content">
					<div class="card-meta"><span>${safeCategory}</span><span>${escapeHTML(item.year)}</span></div>
					<p class="card-description">${safeDescription}</p>
					<div class="card-footer">${rating}<button class="remove-btn" type="button" data-action="remove" data-id="${escapeHTML(item.id)}" aria-label="Remover ${safeTitle} da coleção"><i class="bi bi-trash3 me-1"></i> Remover</button></div>
				</div>
			</article>
		</div>`;
}

function renderCatalog() {
	const visibleTitles = getVisibleTitles();
	catalogGrid.innerHTML = visibleTitles.map(createCard).join("");
	resultCount.textContent = visibleTitles.length;
	navFavCount.textContent = titles.filter((item) => item.favorite).length;
	emptyState.hidden = visibleTitles.length !== 0;
}

function showFeedback(message, type = "success") {
	window.clearTimeout(feedbackTimeout);
	feedback.textContent = message;
	feedback.classList.toggle("error", type === "error");
	feedback.hidden = false;
	feedbackTimeout = window.setTimeout(() => {
		feedback.hidden = true;
	}, 4200);
}

function setFavoritesFilter(enabled) {
	favoritesOnly = enabled;
	favoritesFilter.classList.toggle("active", enabled);
	favoritesFilter.setAttribute("aria-pressed", String(enabled));
	favoritesFilter.innerHTML = `<i class="bi ${enabled ? "bi-heart-fill" : "bi-heart"} me-2"></i> Só favoritos`;
	renderCatalog();
}

function validateForm() {
	const nameInput = document.querySelector("#titleName");
	const yearInput = document.querySelector("#titleYear");
	const descriptionInput = document.querySelector("#titleDescription");

	nameInput.setCustomValidity(nameInput.value.trim().length >= 2 ? "" : "Informe pelo menos 2 caracteres.");
	yearInput.setCustomValidity(Number(yearInput.value) >= 1900 && Number(yearInput.value) <= 2099 ? "" : "Informe um ano entre 1900 e 2099.");
	descriptionInput.setCustomValidity(descriptionInput.value.trim().length >= 8 ? "" : "A descrição precisa ter pelo menos 8 caracteres.");

	const isValid = titleForm.checkValidity();
	titleForm.classList.add("was-validated");
	return isValid;
}

searchInput.addEventListener("input", renderCatalog);
categoryFilter.addEventListener("change", renderCatalog);
favoritesFilter.addEventListener("click", () => setFavoritesFilter(!favoritesOnly));
navFavorites.addEventListener("click", (event) => {
	event.preventDefault();
	setFavoritesFilter(!favoritesOnly);
	document.querySelector("#catalogo").scrollIntoView({ behavior: "smooth" });
});

catalogGrid.addEventListener("click", (event) => {
	const button = event.target.closest("button[data-action]");
	if (!button) return;

	const selectedTitle = titles.find((item) => item.id === button.dataset.id);
	if (!selectedTitle) return;

	if (button.dataset.action === "favorite") {
		selectedTitle.favorite = !selectedTitle.favorite;
		saveTitles();
		renderCatalog();
		showFeedback(selectedTitle.favorite ? `“${selectedTitle.title}” adicionado aos favoritos.` : `“${selectedTitle.title}” removido dos favoritos.`);
	}

	if (button.dataset.action === "remove") {
		titles = titles.filter((item) => item.id !== selectedTitle.id);
		saveTitles();
		renderCatalog();
		showFeedback(`“${selectedTitle.title}” removido da coleção.`);
	}
});

titleForm.addEventListener("input", (event) => {
	event.target.setCustomValidity("");
});

titleForm.addEventListener("submit", (event) => {
	event.preventDefault();
	if (!validateForm()) {
		titleForm.querySelector(":invalid")?.focus();
		return;
	}

	const formData = new FormData(titleForm);
	const titleName = formData.get("title").trim();
	const duplicate = titles.some((item) => item.title.toLocaleLowerCase("pt-BR") === titleName.toLocaleLowerCase("pt-BR"));
	if (duplicate) {
		document.querySelector("#titleName").setCustomValidity("Este título já está na coleção.");
		document.querySelector("#titleName").reportValidity();
		showFeedback("Esse título já existe na sua coleção.", "error");
		return;
	}

	titles.unshift({
		id: `title-${Date.now()}`,
		title: titleName,
		category: formData.get("category"),
		year: Number(formData.get("year")),
		description: formData.get("description").trim(),
		favorite: false,
		rating: ""
	});

	saveTitles();
	titleForm.reset();
	titleForm.classList.remove("was-validated");
	categoryFilter.value = "Todos";
	searchInput.value = "";
	setFavoritesFilter(false);
	bootstrap.Modal.getOrCreateInstance(document.querySelector("#addTitleModal")).hide();
	showFeedback(`“${titleName}” adicionado à sua coleção.`);
});

document.querySelector("#addTitleModal").addEventListener("hidden.bs.modal", () => {
	titleForm.classList.remove("was-validated");
});

renderCatalog();
