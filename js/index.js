//DOM content manipulation
document.addEventListener("DOMContentLoaded", function () {
  localStorage.setItem("firstParty", "true");
  let deleteAll = document.querySelector(".delete-all");
  deleteAll.addEventListener("click", deleteAllCookies);
  let bodySect = document.querySelector(".table-body");
  let cookiesSect = document.querySelector(".cookies-section");
  let tableSect = document.querySelector(".table-container");
  let allcookies;
  let url;
  let newName;

  let thirdSwitch = document.querySelector(".third-party");
  thirdSwitch.style.display = "none";

  let tab1 = document.querySelector(".tab1");
  let tab2 = document.querySelector(".tab2");
  let tab1__title = document.querySelector(".tab1__title");
  let tab2__title = document.querySelector(".tab2");
  let tab__desc = document.querySelector(".tab__desc");
  let switchOnFirst = document.querySelector(".switch-on-first");
  let switchOffFirst = document.querySelector(".switch-off-first");

  switchOnFirst.addEventListener("click", onFirst);
  switchOffFirst.addEventListener("click", offFirst);

  if (localStorage.getItem("onFirst")) {
    switchOffFirst.style.display = "none";
    switchOnFirst.style.display = "flex";
  }

  //Turn off auto-delete for firsty-party cookies
  function offFirst() {
    switchOffFirst.style.display = "none";
    switchOnFirst.style.display = "flex";
    localStorage.setItem("onFirst", "true");
    localStorage.removeItem("offFirst");
  }

  //Turn on auto-delete on firsty party cookies
  function onFirst() {
    switchOffFirst.style.display = "flex";
    switchOnFirst.style.display = "none";
    localStorage.setItem("offFirst", "true");
    localStorage.removeItem("onFirst");
  }

  //Clear DOM to allow live updating (without reloading)
  function cleardom() {
    bodySect.innerHTML = "";
  }

  //Mount cookies data in the table
  function rerender(filteredCookies) {
    filteredCookies.map((item) => {
      let tableRow = ` <tr>
      <td class="cookie-name-input"><div style='width: 100px;  white-space: nowrap;overflow: hidden; text-overflow: ellipsis;'>${item.name}</div></td>
      <td>${item.domain}</td>
      <td >
        <img src="./assets/trash.png" alt="trash-icon" class="delete-cookie-button"/>
      </td>
    </tr>`;
      bodySect.insertAdjacentHTML("beforeend", tableRow);
    });
    let delBtns = [...document.querySelectorAll(".delete-cookie-button")];
    delBtns.forEach((btn, index) => {
      btn.addEventListener("click", (e) => {
        deleteCookie(index);
      });
    });
  }

  // Delete a single cookie
  function deleteCookie(index) {
    // console.log("deleting a cookie...........", index);
    let availableCookies = [];
    //  console.log("localstorage ....", localStorage.getItem("firstParty"));

    //Delete a first-party cookie
    if (localStorage.getItem("firstParty") == "true") {
      generateFirst(allcookies)
        .then((cookies) => {
          availableCookies = cookies;
          let cookieNeeded = availableCookies[index];
          // console.log("cookiename....", cookieNeeded.name);

          chrome.cookies.remove(
            { url: cookieNeeded.url, name: cookieNeeded.name },
            (deletedCookie) => {
              console.log(`Deleted cookie ${deletedCookie}`);
            }
          );
          allcookies = allcookies.filter(
            (cookie) => cookie.name != cookieNeeded.name
          );
          availableCookies = availableCookies.filter(
            (cookie) => cookie.name != cookieNeeded.name
          );
          if (availableCookies.length === 0) {
            deletedMode("bigtrash", "All cookies were deleted");
            return;
          }
          cleardom();
          rerender(availableCookies);
          //  console.log("deletedCookie..........");
        })
        .catch((error) => {
          console.log(error);
        });
    }

    //Delete a third-party cookie
    if (localStorage.getItem("firstParty") == "false") {
      generateThird(allcookies)
        .then((cookies) => {
          availableCookies = cookies;
          let cookieNeeded = availableCookies[index];
          // console.log("cookiename....", cookieNeeded.name);
          // console.log("cookiurl....", cookieNeeded.url);
          chrome.cookies.remove(
            { url: cookieNeeded.url, name: cookieNeeded.name },
            (deletedCookie) => {
              console.log(`Deleted cookie ${deletedCookie}`);
            }
          );
          allcookies = allcookies.filter(
            (cookie) => cookie.name != cookieNeeded.name
          );
          availableCookies = availableCookies.filter(
            (cookie) => cookie.name != cookieNeeded.name
          );
          if (availableCookies.length === 0) {
            deletedMode("bigtrash", "All cookies were deleted");
            return;
          }
          cleardom();
          rerender(availableCookies);
          // console.log("deletedCookie..........");
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  // Delete all cookies
  function deleteAllCookies() {
    // console.log("deleting cookies...........");
    let availableCookies = [];
    // console.log("localstorage ....", localStorage.getItem("firstParty"));

    //Delete all first-party cookies
    if (localStorage.getItem("firstParty") == "true") {
      generateFirst(allcookies)
        .then((cookies) => {
          availableCookies = cookies;
          availableCookies.forEach((cookie) => {
            chrome.cookies.remove(
              { url: cookie.url, name: cookie.name },
              (deletedCookie) => {
                console.log(`Deleted cookie ${cookie.name}`);
              }
            );
          });
          allcookies = allcookies.filter(function (cookie) {
            return cookie.domain.indexOf(newName[1]) == -1;
          });
          cleardom();
          deletedMode("bigtrash", "All cookies were deleted");
          console.log("deletedallCookie..........");
        })
        .catch((error) => {
          console.log(error);
        });
    }

    //Delete all third-party cookies
    if (localStorage.getItem("firstParty") == "false") {
      generateThird(allcookies)
        .then((cookies) => {
          availableCookies = cookies;

          availableCookies.forEach((cookie) => {
            chrome.cookies.remove(
              { url: cookie.url, name: cookie.name },
              (deletedCookie) => {
                console.log(`Deleted cookie ${cookie.name}`);
              }
            );
          });
          allcookies = allcookies.filter(function (cookie) {
            return cookie.domain.indexOf(newName[1]) !== -1;
          });
          cleardom();
          deletedMode("bigtrash", "All cookies were deleted");
          //console.log("deletedallCookie..........");
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  // Display all cookies were deleted
  const deletedMode = (icon, text) => {
    let cookieData = `<img src="assets/${icon}.png" alt="emoji" />
      <span class="message">${text}</span>`;
    tableSect.style.display = "none";
    cookiesSect.style.display = "flex";
    cookiesSect.innerHTML = cookieData;
  };

  // Display first-party cookies
  function displayFirstPartyCookies(allcookies) {
    localStorage.setItem("firstParty", "true");

    let switchOnFirst = document.querySelector(".first-party");
    switchOnFirst.style.display = "flex";
    let switchOffFirst = document.querySelector(".third-party");
    switchOffFirst.style.display = "none";

    cookiesSect.style.display = "none";
    tableSect.style.display = "flex";
    tab__desc.textContent =
      "These are cookies that are directly stored by the website (or domain) you're visiting.";
    tab1__title.style.color = "#054a91";
    tab1.style.background = "#eff7ff";
    tab1.style.borderBottom = "1px solid #054a91";
    tab2.style.background = "white";
    tab2.style.borderBottom = "1px solid #a3b8c1";
    tab2__title.style.color = "#a3b8c1";
    // console.log("First party cookies..........", allcookies);
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      try {
        let currentTabUrl = tabs[0].url;
        url = new URL(currentTabUrl);
        //console.log("url", url);
        let domainName = url.hostname;
        // console.log("domainName", domainName);
        if (domainName === "newtab") {
          deletedMode("emojiNormal", "No cookies being stored");
          return;
        }
        let domainRegx = /.*?([\w]+\.[\w]+)$/;
        newName = domainName.match(domainRegx);
        console.log("correctDomainName", newName[1]);
        let filteredCookies;
        let firstParty = [];
        filteredCookies = allcookies.filter(function (cookie) {
          return cookie.domain.indexOf(newName[1]) !== -1;
        });
        filteredCookies.forEach((element) => {
          firstParty.push({
            domain: element.domain,
            name: element.name,
            domain: element.domain,
            url: element.sourceUrl,
          });
        });
        cleardom();
        if (firstParty.length == 0) {
          deletedMode("emojiNormal", "No cookies being stored");
          return;
        }
        rerender(firstParty);
      } catch (error) {
        console.log(error);
      }
    });
  }

  let switchOnThird = document.querySelector(".switch-on-third");
  let switchOffThird = document.querySelector(".switch-off-third");

  //Turn off auto-delete for third party cookies
  function offThird() {
    switchOffThird.style.display = "none";
    switchOnThird.style.display = "flex";
    localStorage.setItem("onThird", "true");
    localStorage.removeItem("offThird");
  }

  //Turn on auto-delete for third party cookies
  function onThird() {
    switchOffThird.style.display = "flex";
    switchOnThird.style.display = "none";
    localStorage.setItem("offThird", "true");
    localStorage.removeItem("onThird");
  }

  // Display third-party cookies
  function displaythird(allcookies) {
    localStorage.setItem("firstParty", "false");

    let first_party = document.querySelector(".first-party");
    first_party.style.display = "none";
    let third_party = document.querySelector(".third-party");
    third_party.style.display = "flex";

    switchOnThird.addEventListener("click", onThird);
    switchOffThird.addEventListener("click", offThird);

    if (localStorage.getItem("onThird")) {
      switchOffThird.style.display = "none";
      switchOnThird.style.display = "flex";
    }

    cookiesSect.style.display = "none";
    tableSect.style.display = "flex";
    tab__desc.textContent =
      "These are cookies that are set by a website other than the one you are currently on.";
    tab1__title.style.color = "#a3b8c1";
    tab2__title.style.color = "#054a91";
    tab1.style.background = "white";
    tab1.style.borderBottom = "1px solid #a3b8c1";
    tab2.style.background = "#eff7ff";
    tab2.style.borderBottom = "1px solid  #054a91";
    // console.log("thirdparty  cookies..........");

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      try {
        let currentTabUrl = tabs[0].url;
        url = new URL(currentTabUrl);
        //console.log("url", url);
        let domainName = url.hostname;
        // console.log("domainName", domainName);

        let domainRegx = /.*?([\w]+\.[\w]+)$/;
        newName = domainName.match(domainRegx);
        //  console.log("correctDomainName", newName[1]);

        let thirdcookies = [];
        let filteredthirdParty = [];

        //  console.log("retrieved all cookies",cookies)

        thirdcookies = allcookies.filter(function (cookie) {
          return cookie.domain.indexOf(newName[1]) == -1;
        });

        thirdcookies.forEach((element) => {
          filteredthirdParty.push({
            domain: element.domain,
            name: element.name,
            url: element.sourceUrl,
          });
        });
        cleardom();
        if (filteredthirdParty.length == 0) {
          deletedMode("emojiNormal", "No cookies being stored");
          return;
        }
        rerender(filteredthirdParty);
        //   console.log("filtered third party cookies", filteredthirdParty);
      } catch (error) {
        console.log(error);
      }
    });
  }

  // Generate the first-party cookies
  function generateFirst(allcookies) {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        try {
          let currentTabUrl = tabs[0].url;
          url = new URL(currentTabUrl);
          let domainName = url.hostname;
          let domainRegx = /.*?([\w]+\.[\w]+)$/;
          newName = domainName.match(domainRegx);
          let filteredCookies;
          filteredCookies = allcookies.filter(function (cookie) {
            return cookie.domain.indexOf(newName[1]) !== -1;
          });
          let firstParty = [];
          filteredCookies.forEach((element) => {
            firstParty.push({
              domain: element.domain,
              name: element.name,
              domain: element.domain,
              url: element.sourceUrl,
            });
          });
          resolve(firstParty);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  // Generate the third-party cookies
  function generateThird(allcookies) {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        try {
          let currentTabUrl = tabs[0].url;
          url = new URL(currentTabUrl);
          let domainName = url.hostname;
          let domainRegx = /.*?([\w]+\.[\w]+)$/;
          newName = domainName.match(domainRegx);
          let filteredCookies;
          filteredCookies = allcookies.filter(function (cookie) {
            return cookie.domain.indexOf(newName[1]) == -1;
          });
          let firstParty = [];
          filteredCookies.forEach((element) => {
            firstParty.push({
              domain: element.domain,
              name: element.name,
              domain: element.domain,
              url: element.sourceUrl,
            });
          });
          resolve(firstParty);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  // AutoDelete all cookies
  function autodelete() {
    let availableCookies = [];

    if (localStorage.getItem("onFirst") == "true") {
      generateFirst(allcookies)
        .then((cookies) => {
          availableCookies = cookies;
          // console.log("autodeleting cookies.first1..........");

          chrome.runtime.sendMessage(
            { type: "firstlistener", data: availableCookies },
            function (response) {
              console.log("firstListener registered");
            }
          );
        })
        .catch((error) => {
          console.log(error);
        });
    }
    if (localStorage.getItem("onThird") == "true") {
      generateThird(allcookies)
        .then((cookies) => {
          availableCookies = cookies;
          // console.log("autodeleting cookies.third1..........");
          chrome.runtime.sendMessage(
            { type: "thirdlistener", data: availableCookies },
            function (response) {
              console.log("thirdlistener registered");
            }
          );
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  // Initial rendering of data
  function testcookies(displayFirstPartyCookies) {
    chrome.runtime.sendMessage({ type: "getCookies" }, (response) => {
      // console.log(response.urls, response.cookies);
      allcookies = [...response.cookies];
      // console.log("allcokies", allcookies);
      displayFirstPartyCookies(allcookies);
      tab1.addEventListener("click", () => {
        displayFirstPartyCookies(allcookies);
      });
      tab2.addEventListener("click", () => {
        displaythird(allcookies);
      });
      autodelete();
    });
  }

  testcookies(displayFirstPartyCookies);
});
