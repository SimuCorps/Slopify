let displayedCount = 5;

const escapeHtml = html =>
    html
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

const renderComments = comments => {
    document.getElementById("comments").innerHTML = comments.map(x => `
        <div id="comment">
            <div>
                <span>${x.twitter_handle ? `<a href="https://twitter.com/${x.twitter_handle}">@${x.twitter_handle}</a>` : "Anon"}</span>

                <span>(#${x.id}) ${x.createdAt}</span>
            </div>

            <span>${escapeHtml(x.content)}</span>
        </div>
    `).join("");
}

const fetchComments = async () => {
    console.log("Refreshing comments..");

    const response = await fetch(`/api/comments?count=${displayedCount}`);
    renderComments(await response.json());
}

const showMore = () => {
    if(displayedCount >= 25) return document.getElementById("comments-show-more-btn").remove();

    displayedCount += 5;

    fetchComments();

    console.log("Showing more", displayedCount);
}

setInterval(() => {
    if(!document.hasFocus()) return; // prevent background server spam

    fetchComments();
}, 30_000);

fetchComments();

const comment = async () => {
    // this code is so ass

    const twitterHandle = document.getElementById("comment-twitter-handle").value;
    const content = document.getElementById("comment-content").value;

    document.getElementById("comment-twitter-handle").value = "";
    document.getElementById("comment-content").value = "";

    try {
        const response = await fetch("/api/comments", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"  
            },
            body: JSON.stringify({
                twitter_handle: twitterHandle,
                content
            })
        });

        if(response.status != 200) {
            throw new (class extends Error {
                name = response.status.toString();
            })(await response.text());
        }

        console.log("Posted!");
    } catch(e) {
        alert(`${e.name}: ${e.message}`);
        location.reload();
    }

    await fetchComments();
}