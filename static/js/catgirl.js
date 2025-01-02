function downloadCatgirl() {
  const imageUrl = document.getElementById("catgirl").src;
  const fileName = imageUrl.split("/").pop().split("\\").pop();

  fetch(imageUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `http error (translation: skill issue): ${response.status}`,
        );
      }
      return response.blob();
    })
    .then((blob) => {
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);
    })
    .catch((error) => {
      alert(`javascript broke. can't download catgirl. ${error}`);
    });
}

function anotherCatgirl() {
  const catgirl = document.getElementById("catgirl");
  catgirl.src = "#";
  catgirl.alt = "loading!! be patient etc uwu meow nyaaaa";
  try {
    console.log("trying");
    fetch("https://nekos.best/api/v2/neko")
      .then((response) => response.json())
      .then((json) => (catgirl.src = json.results[0].url));
    catgirl.alt = "catgirl";
  } catch (e) {
    catgirl.alt = `shit happened: ${e}`;
    console.error(e);
  }
}

anotherCatgirl();
