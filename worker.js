addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request))
  })
  
  async function handleRequest(request) {
    if(request.method !== "POST") return new Response("Use POST", {status:405})
  
    const payload = await request.json();
    const action = payload.action;
    const inputs = {
      action: action,
      password: payload.password,
      title: payload.title,
      author: payload.author,
      price: payload.price,
      imageUrl: payload.imageUrl,
      index: payload.index // For edit/delete
    };

    // Cloudflare GitHub integration handles auth
    const githubRes = await fetch("https://api.github.com/repos/Ulfat-Bajee/maktab-shop/actions/workflows/update-books.yml/dispatches", { // Replace with your repo
      method: "POST",
      headers: {
        "Accept": "application/vnd.github+json",
        "User-Agent": "Cloudflare-Worker"
      },
      body: JSON.stringify({
        ref: "main",  // branch to trigger
        inputs: inputs
      })
    });

    if(githubRes.ok){
      return new Response("Success", {status:200})
    } else {
      const text = await githubRes.text()
      return new Response("Failed: " + text, {status:500})
    }
  }
  