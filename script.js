// ==UserScript==
// @name         Server Hop Script
// @version      2025-04-18
// @description  Adds a button to server hop, ignoring any friends currently in-game. Because ropro doesn't exist on firefox.
// @author       ImmortalRemnant
// @match        http*://*.roblox.com/games/*
// @grant        GM_notification
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/ImmortalRemnant/roblox-serverhop/master/script.js
// @downloadURL  https://raw.githubusercontent.com/ImmortalRemnant/roblox-serverhop/master/script.js
// ==/UserScript==

function awaitElement(selector, parent = document) {
    return new Promise((resolve, reject) => {
        const ELEMENT = parent.querySelector(selector)
        if (ELEMENT) resolve(ELEMENT)

        let resolved = false
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                for (var node of Array.from(mutation.addedNodes)) {
                    if (node.matches && node.matches(selector)) {
                        observer.disconnect()
                        resolved = true

                        resolve(node)
                    }
                }
            })
        })

        observer.observe(parent, {
            childList: true,
            subtree: true
        })

        setTimeout(() => {
            if (resolved == false) {
                reject()
            }
        }, 10000)
    })
}

(async () => {
    const gid = String(location.href.match(/\/(\d+)\//g)).match(/\d+/g);
    if (!gid) return;

    const searchForGame = function (gid) {
        fetch(`https://games.roblox.com/v1/games/${gid}/servers/0?sortOrder=1&excludeFullGames=true&limit=100`) 
            .then((resp) => resp.json())
            .then(function (data) {
            if (data.data.length != 0) {
                var server = data.data[Math.floor(Math.random() * data.data.length)];
                if (server != null && server.playing < server.maxPlayers && server.playing > 0) {
                    try {
                        /*eslint no-undef: 0*/
                        Roblox.GameLauncher.joinGameInstance(Number(gid), server.id);
                    } catch (e) {
                        console.log('Error:', e);
                    };
                    return true;
                } else {
                    // no open servers, don't do anything
                }
            } else {
                // no existing servers, don't do anything
            }
        })
    }

    awaitElement("#container-main .content")
        .then(content => {
        const container = document.createElement("div")
        const serverHopButton = document.createElement("button")

        container.classList.add("game-details-play-button-container")
        container.setAttribute("style", "display: flex; width: 100%; margin-top: 0.3rem; column-gap: 0.3rem;")

        serverHopButton.classList.add("btn-control-sm")
        serverHopButton.classList.add("btn-full-width")
        serverHopButton.textContent = "Server Hop"
        serverHopButton.addEventListener("click", () => {
            searchForGame(gid);
        })
        container.append(serverHopButton)
        document.getElementsByClassName('game-details-play-button-container')[0].after(container);
    })
})();
