const body = document.getElementById('data')
const apikey = '2d89d87c49894a9c9da9d70c044fe756'
const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const sourceSelector = document.getElementById("sourceSelector");
const defaultSource = "bbc-news"

if ('serviceWorker' in navigator) 
{
  window.addEventListener('load', () =>
    navigator.serviceWorker.register('serviceworker.js').
    then(registration => console.log('Service Worker registered')).
    catch(err => 'SW registration failed'));
}


window.addEventListener('load',e =>
{
    updateNews();
    updateSources().then(() => {
      sourceSelector.value = defaultSource;
      updateNews();
    });
    sourceSelector.addEventListener('change', e =>{
      updateNews(e.target.value);
    })
});
async function updateSources()
{
  url = `https://newsapi.org/v2/sources?apiKey=${apikey}`;
  res = await fetch(url);
  json = await res.json();
  sourceSelector.innerHTML = json.sources.map((source)=>{
    return `<option value ="${source.id}">${source.name}</option>`
  }).join('\n');
}
async function updateNews(source = defaultSource)
{
    url = `https://newsapi.org/v2/top-headlines?sources=${source}&apiKey=${apikey}`;
    res = await fetch(url);
    json =await res.json();
    body.innerHTML = json.articles.map(createArticle).join('\n'); 
}
function createArticle(article) {
    return `
    <div class="col-sm-3 mx-3 my-3">
      <div class="card">
        <a class="img-card" href="${article.url}" target="_blank">
          <img src="${article.urlToImage}" />
        </a>
        <div class="card-content">
            <h4 class="card-title">
                <a href="${article.url}" target="_blank"> ${article.title}</a>
            </h4>
            <p class="">
                ${article.description}
            </p>
        </div>
        <div class="card-read-more">
            <a href="${article.url}" target="_blank" class="btn btn-link btn-block">
                Read More
            </a>
        </div>
      </div>
    </div>
    `;
  }