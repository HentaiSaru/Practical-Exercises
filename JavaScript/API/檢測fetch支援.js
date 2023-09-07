async function FetchCheck(url) {
    fetch(url).then(response => {
        if (response.ok) {
            console.log("網站可使用 fetch");
        } else {
            console.log("網站不可使用 fetch", response.status);
        }
    })
    .catch(error => {
        console.log("網站不可使用 fetch");
    });
}
FetchCheck(window.location.href);