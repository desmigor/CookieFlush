chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getCookies") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          func: async () =>
            performance.getEntriesByType("resource").map((e) => e.name),
        },
        (data) => {
          // console.log("data.....", data[0].result);

          if (chrome.runtime.lastError || !data || !data[0].result) return;
          const urls = data[0].result.map((url) => url.split(/[#?]/)[0]);
          const uniqueUrls = [...new Set(urls).values()].filter(Boolean);
          Promise.all(
            uniqueUrls.map(
              (url) =>
                new Promise((resolve) => {
                  chrome.cookies.getAll({ url }, (cookies) => {
                    // Add the source URL to each cookie object
                    cookies.forEach((cookie) => (cookie.sourceUrl = url));
                    resolve(cookies);
                  });
                })
            )
          ).then((results) => {
            // convert the array of arrays into a deduplicated flat array of cookies
            const cookies = [
              ...new Map(
                [].concat(...results).map((c) => [JSON.stringify(c), c])
              ).values(),
            ];

            const filteredArray = cookies.reduce(
              (accumulator, currentObject) => {
                const objectExists = accumulator.find(
                  (obj) => obj.name === currentObject.name
                );
                if (!objectExists) {
                  accumulator.push(currentObject);
                }
                return accumulator;
              },
              []
            );

            console.log("filteredArray", filteredArray);

            // Send the cookies back to the content script
            sendResponse({ urls: uniqueUrls, cookies: filteredArray });
          });
        }
      );
    });

    // Return true to indicate that the response will be sent asynchronously
    return true;
  }

  if (message.type === "firstlistener") {
    chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
      message.data.forEach((cookie) => {
        chrome.cookies.remove(
          { url: cookie.url, name: cookie.name },
          (deletedCookie) => {
            console.log(`Deleted cookie ${cookie.name}`);
          }
        );
      });
    });
    sendResponse({ success: true });
  }

  if (message.type === "thirdlistener") {
    chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
      message.data.forEach((cookie) => {
        chrome.cookies.remove(
          { url: cookie.url, name: cookie.name },
          (deletedCookie) => {
            console.log(`Deleted cookie ${cookie.name}`);
          }
        );
      });
    });
    sendResponse({ success: true });
  }
});
