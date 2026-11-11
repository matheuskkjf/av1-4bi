var titles = [
	{ title: "Interestelar", category: "Filme", year: 2014, description: "Uma jornada além das estrelas para salvar o futuro da humanidade.", favorite: true, rating: "8,7" }, { title: "Valorant", category: "Jogo", year: 2020, description: "Um jogo de tiro tático com personagens únicos.", favorite: false, rating: "9,0" },
	{ title: "Horizon Forbidden West", category: "Jogo", year: 2022, description: "Explore um mundo exuberante e misterioso em uma aventura épica.", favorite: false, rating: "8,5" }, { title: "As branquelas", category: "Filme", year: 2004, description: "Dois agentes e o latrel.", favorite: true, rating: "8,6" },
	{ title: "The Last of Us", category: "Série", year: 2023, description: "Em um mundo transformado, duas vidas se cruzam em uma viagem perigosa.", favorite: false, rating: "8,8" }, { title: "Stardew Valley", category: "Jogo", year: 2016, description: "Recomece a vida no campo e descubra os segredos do vale.", favorite: true, rating: "8,9" },
	{ title: "Tadeo Jones", category: "Filme", year: 2004, description: "Uma aventura surpreendente através de possibilidades infinitas.", favorite: false, rating: "7,8" }, { title: "Pokemon", category: "Série", year: 2022, description: "Um jovem mestre em um mundo de pokémons.", favorite: false, rating: "8,6" }
];
var favoritesOnly = false, catalogGrid = document.querySelector("#catalogGrid"), titleForm = document.querySelector("#titleForm");
function escapeHTML(text) { return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); }
function createCard(item, i) {
	var label = item.favorite ? "Favorito" : "Favoritar", style = item.favorite ? "is-favorite" : "", rating = item.rating ? "Nota: " + escapeHTML(item.rating) : "Minha coleção";
	return '<div class="col-12 col-sm-6 col-lg-4 catalog-grid-col"><article class="catalog-card">' +
		'<div class="poster poster-tone-' + (i % 6) + '"><div class="poster-topline"><span class="category-pill">' + escapeHTML(item.category) + '</span><button class="favorite-btn ' + style + '" onclick="toggleFavorite(' + i + ')">' + label + '</button></div>' +
		'<h3 class="poster-title">' + escapeHTML(item.title) + '</h3></div><div class="card-content"><div class="card-meta"><span>' + escapeHTML(item.category) + '</span><span>' + item.year + '</span></div>' +
		'<p class="card-description">' + escapeHTML(item.description) + '</p><div class="card-footer">' + rating + '<button class="remove-btn" onclick="removeTitle(' + i + ')">Remover</button></div></div></article></div>';
}
function renderCatalog() {
	var search = document.querySelector("#searchInput").value.toLowerCase(), category = document.querySelector("#categoryFilter").value, html = "", count = 0, favorites = 0;
	for (var i = 0; i < titles.length; i++) {
		var item = titles[i], text = (item.title + " " + item.description).toLowerCase();
		if (item.favorite) favorites++;
		if (text.indexOf(search) !== -1 && (category === "Todos" || item.category === category) && (!favoritesOnly || item.favorite)) { html += createCard(item, i); count++; }
	}
	catalogGrid.innerHTML = html; document.querySelector("#resultCount").textContent = count;
	document.querySelector("#navFavCount").textContent = favorites; document.querySelector("#emptyState").hidden = count > 0;
}
function toggleFavorite(i) { titles[i].favorite = !titles[i].favorite; renderCatalog(); }
function removeTitle(i) { titles.splice(i, 1); renderCatalog(); showFeedback("Título removido da coleção."); }
function toggleFavorites() { favoritesOnly = !favoritesOnly; var button = document.querySelector("#favoritesFilter"); button.className = favoritesOnly ? "btn favorites-filter w-100 active" : "btn favorites-filter w-100"; button.setAttribute("aria-pressed", favoritesOnly); renderCatalog(); }
function showFeedback(message) { var box = document.querySelector("#feedback"); box.textContent = message; box.hidden = false; }
document.querySelector("#searchInput").oninput = renderCatalog; document.querySelector("#categoryFilter").onchange = renderCatalog; document.querySelector("#favoritesFilter").onclick = toggleFavorites;
document.querySelector("#navFavorites").onclick = function (event) { event.preventDefault(); toggleFavorites(); document.querySelector("#catalogo").scrollIntoView(); };
titleForm.onsubmit = function (event) {
	event.preventDefault(); var name = document.querySelector("#titleName"), description = document.querySelector("#titleDescription");
	if (!titleForm.checkValidity()) { titleForm.classList.add("was-validated"); titleForm.reportValidity(); return; }
	if (name.value.trim().length < 2 || description.value.trim().length < 8) { showFeedback("Preencha o nome e a descrição corretamente."); if (name.value.trim().length < 2) name.focus(); else description.focus(); return; }
	for (var i = 0; i < titles.length; i++) if (titles[i].title.toLowerCase() === name.value.trim().toLowerCase()) { showFeedback("Esse título já está na coleção."); name.focus(); return; }
	titles.unshift({ title: name.value.trim(), category: document.querySelector("#titleCategory").value, year: document.querySelector("#titleYear").value, description: description.value.trim(), favorite: false, rating: "" });
	titleForm.reset(); titleForm.classList.remove("was-validated"); document.querySelector("#categoryFilter").value = "Todos"; document.querySelector("#searchInput").value = ""; if (favoritesOnly) toggleFavorites(); else renderCatalog();
	bootstrap.Modal.getOrCreateInstance(document.querySelector("#addTitleModal")).hide(); showFeedback("Título adicionado à coleção.");
}; renderCatalog();