addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request))
  })
  
  async function handleRequest(request) {
    if(request.method !== "POST") return new Response("Use POST", {status:405})
  
    const data = await request.json()
  
    // Cloudflare GitHub integration handles auth
    const githubRes = await fetch("https://api.github.com/repos/Ulfat-Bajee/maktab-shop/actions/workflows/update-books.yml/dispatches", {
      method: "POST",
      headers: {
        "Accept": "application/vnd.github+json"
      },
      body: JSON.stringify({
        ref: "main",  // branch to trigger
        inputs: data
      })
    })
  
    if(githubRes.ok){
      return new Response("Success", {status:200})
    } else {
      const text = await githubRes.text()
      return new Response("Failed: " + text, {status:500})
    }
  }
  