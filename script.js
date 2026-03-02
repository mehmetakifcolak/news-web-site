const apiKey = 'pub_f22fb034c20645bd9c958ad27dfcf085';
const apiUrl = 'https://newsdata.io/api/1/news';

let currentCategory = 'top';
let searchQuery = '';
let nextToken = null;

// Sayfa yüklendiğinde çalışacaklar
window.onload = function () {
    loadNews();

    // Kategori butonları
    const categoryButtons = document.querySelectorAll('.kategoriler button');
    categoryButtons.forEach(btn => {
        btn.onclick = function () {
            currentCategory = this.getAttribute('data-cat');
            searchQuery = '';
            document.getElementById('searchInput').value = '';

            // Aktif butonu değiştir
            categoryButtons.forEach(b => b.classList.remove('aktif'));
            this.classList.add('aktif');

            document.getElementById('pageTitle').innerText = this.innerText + ' Haberleri';
            loadNews();
        };
    });

    // Menü linkleri
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.onclick = function (e) {
            e.preventDefault();
            currentCategory = this.getAttribute('data-cat');
            loadNews();
        };
    });

    // Ara butonu
    document.getElementById('searchBtn').onclick = handleSearch;
    document.getElementById('searchInput').onkeypress = function (e) {
        if (e.key === 'Enter') handleSearch();
    };

    // Daha fazla göster
    document.getElementById('loadMoreBtn').onclick = function () {
        if (nextToken) loadNews(true);
    };
};

function handleSearch() {
    const value = document.getElementById('searchInput').value.trim();
    if (value) {
        searchQuery = value;
        currentCategory = '';
        document.getElementById('pageTitle').innerText = '"' + value + '" Araması';
        loadNews();
    }
}

async function loadNews(isMore = false) {
    const listElement = document.getElementById('newsList');

    if (!isMore) {
        listElement.innerHTML = '<p>Haberler yükleniyor...</p>';
    }

    let url = apiUrl + '?apikey=' + apiKey + '&language=tr';

    if (searchQuery) {
        url += '&q=' + searchQuery;
    } else {
        url += '&category=' + currentCategory;
    }

    if (isMore && nextToken) {
        url += '&page=' + nextToken;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'success') {
            nextToken = data.nextPage;

            const html = data.results.map(item => `
                <div class="haber-kart">
                    <img src="${item.image_url || 'https://via.placeholder.com/400x200?text=Haber'}" alt="">
                    <h3>${item.title}</h3>
                    <p>${item.description ? item.description.substring(0, 150) + '...' : 'Detaylar için tıklayın.'}</p>
                    <a href="${item.link}" target="_blank">Devamını Oku</a>
                </div>
            `).join('');

            if (isMore) {
                listElement.innerHTML += html;
            } else {
                listElement.innerHTML = html;
            }

            document.getElementById('loadMoreBtn').style.display = nextToken ? 'block' : 'none';
        }
    } catch (err) {
        listElement.innerHTML = '<p>Bir hata oluştu. Lütfen sonra tekrar deneyin.</p>';
        console.log(err);
    }
}
