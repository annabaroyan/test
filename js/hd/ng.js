// Make datepicker field wider for auth logs if opened in iframe
if ( (window.location.hash.search('auth/log') !== -1) && (window.self !== window.top) ) {
  async_querySelector('form[id="filterAuthLogForm"]').then(function(box) {
    console.log(box);
    box.firstElementChild.classList.remove("grid__box--size-3");
    box.firstElementChild.classList.add("grid__box--size-5");
  })
}
