var initialTitles = [
	{ title: "Interestelar", category: "Filme", year: 2014, description: "Uma jornada além das estrelas para salvar o futuro da humanidade.", favorite: true, rating: "8,7" }, { title: "Valorant", category: "Jogo", year: 2020, description: "Um jogo de tiro tático com personagens únicos.", favorite: false, rating: "9,0" },
	{ title: "Horizon Forbidden West", category: "Jogo", year: 2022, description: "Explore um mundo exuberante e misterioso em uma aventura épica.", favorite: false, rating: "8,5" }, { title: "As branquelas", category: "Filme", year: 2004, description: "Dois agentes e o latrel.", favorite: true, rating: "8,6" },
	{ title: "The Last of Us", category: "Série", year: 2023, description: "Em um mundo transformado, duas vidas se cruzam em uma viagem perigosa.", favorite: false, rating: "8,8" }, { title: "Stardew Valley", category: "Jogo", year: 2016, description: "Recomece a vida no campo e descubra os segredos do vale.", favorite: true, rating: "8,9" },
	{ title: "Tadeo Jones", category: "Filme", year: 2004, description: "Uma aventura surpreendente através de possibilidades infinitas.", favorite: false, rating: "7,8" }, { title: "Pokemon", category: "Série", year: 2022, description: "Um jovem mestre em um mundo de pokémons.", favorite: false, rating: "8,6" }
];
var titles = [], database = null;
var favoritesOnly = false, catalogGrid = document.querySelector("#catalogGrid"), titleForm = document.querySelector("#titleForm");
function openDatabase() {
	return new Promise(function (resolve, reject) {
		if (!window.indexedDB) { reject(new Error("Este navegador não oferece suporte ao banco local.")); return; }
		var request = window.indexedDB.open("FrameCatalogo", 1);
		request.onupgradeneeded = function () { request.result.createObjectStore("titles", { keyPath: "id", autoIncrement: true }); };
		request.onsuccess = function () { database = request.result; resolve(); };
		request.onerror = function () { reject(request.error || new Error("Não foi possível abrir o banco local.")); };
	});
}
function runTransaction(mode, action) {
	return new Promise(function (resolve, reject) {
		if (!database) { reject(new Error("O banco local não está disponível.")); return; }
		var transaction = database.transaction("titles", mode), request;
		try { request = action(transaction.objectStore("titles")); } catch (error) { reject(error); return; }
		transaction.oncomplete = function () { resolve(request ? request.result : undefined); };
		transaction.onerror = function () { reject(transaction.error || new Error("Falha ao salvar no banco local.")); };
		transaction.onabort = function () { reject(transaction.error || new Error("A operação no banco local foi cancelada.")); };
 	});
}
function getAllTitles() {
	return new Promise(function (resolve, reject) {
		var transaction = database.transaction("titles", "readonly"), request = transaction.objectStore("titles").getAll();
		request.onsuccess = function () { resolve(request.result); };
		request.onerror = function () { reject(request.error || new Error("Não foi possível ler o banco local.")); };
	});
}
function seedInitialTitles() {
	return runTransaction("readwrite", function (store) {
		initialTitles.forEach(function (item) { store.add(item); });
		return null;
	});
}
function addToDatabase(item) { return runTransaction("readwrite", function (store) { return store.add(item); }); }
function saveToDatabase(item) { return runTransaction("readwrite", function (store) { return store.put(item); }); }
function deleteFromDatabase(id) { return runTransaction("readwrite", function (store) { return store.delete(id); }); }
function initializeCatalog() {
	openDatabase().then(getAllTitles).then(function (items) {
		if (items.length) return items;
		return seedInitialTitles().then(getAllTitles);
	}).then(function (items) {
		titles = items;
		renderCatalog();
	}).catch(function () {
		titles = initialTitles.map(function (item) { return Object.assign({}, item); });
		showFeedback("Não foi possível acessar o banco local. As alterações não serão salvas.", true);
		renderCatalog();
	});
}
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
function toggleFavorite(i) {
	var item = titles[i];
	item.favorite = !item.favorite;
	saveToDatabase(item).then(renderCatalog).catch(function () { item.favorite = !item.favorite; showFeedback("Não foi possível salvar essa alteração.", true); renderCatalog(); });
}
function removeTitle(i) {
	var item = titles[i];
	deleteFromDatabase(item.id).then(function () {
		titles.splice(titles.indexOf(item), 1);
		renderCatalog();
		showFeedback("Título removido da coleção.");
	}).catch(function () { showFeedback("Não foi possível remover esse título.", true); });
}
function toggleFavorites() { favoritesOnly = !favoritesOnly; var button = document.querySelector("#favoritesFilter"); button.className = favoritesOnly ? "btn favorites-filter w-100 active" : "btn favorites-filter w-100"; button.setAttribute("aria-pressed", favoritesOnly); renderCatalog(); }
function showFeedback(message, isError) { var box = document.querySelector("#feedback"); box.textContent = message; box.className = isError ? "feedback-message error" : "feedback-message"; box.hidden = false; }
document.querySelector("#searchInput").oninput = renderCatalog; document.querySelector("#categoryFilter").onchange = renderCatalog; document.querySelector("#favoritesFilter").onclick = toggleFavorites;
document.querySelector("#navFavorites").onclick = function (event) { event.preventDefault(); toggleFavorites(); document.querySelector("#catalogo").scrollIntoView(); };
titleForm.onsubmit = function (event) {
	event.preventDefault(); var name = document.querySelector("#titleName"), description = document.querySelector("#titleDescription");
	if (!titleForm.checkValidity()) { titleForm.classList.add("was-validated"); titleForm.reportValidity(); return; }
	if (name.value.trim().length < 2 || description.value.trim().length < 8) { showFeedback("Preencha o nome e a descrição corretamente."); if (name.value.trim().length < 2) name.focus(); else description.focus(); return; }
	for (var i = 0; i < titles.length; i++) if (titles[i].title.toLowerCase() === name.value.trim().toLowerCase()) { showFeedback("Esse título já está na coleção."); name.focus(); return; }
	var item = { title: name.value.trim(), category: document.querySelector("#titleCategory").value, year: document.querySelector("#titleYear").value, description: description.value.trim(), favorite: false, rating: "" };
	addToDatabase(item).then(function (id) {
		item.id = id;
		titles.unshift(item);
		titleForm.reset(); titleForm.classList.remove("was-validated"); document.querySelector("#categoryFilter").value = "Todos"; document.querySelector("#searchInput").value = ""; if (favoritesOnly) toggleFavorites(); else renderCatalog();
		bootstrap.Modal.getOrCreateInstance(document.querySelector("#addTitleModal")).hide(); showFeedback("Título adicionado à coleção.");
	}).catch(function () { showFeedback("Não foi possível salvar o título no banco local.", true); });
}; initializeCatalog();