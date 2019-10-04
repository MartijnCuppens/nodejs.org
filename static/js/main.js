;(function () {
  var langPickerTogglerElement = document.querySelector('.lang-picker-toggler')
  var langPickerElement = document.querySelector('.lang-picker')
  var langElements = langPickerElement.querySelectorAll('button')
  // Get the current URL language
  var currentLang = window.location.pathname.split('/')[1] || 'en'
  var currentLangElement = null

  Array.prototype.forEach.call(langElements, function (el) {
    if (el.getAttribute('data-lang') !== currentLang) {
      el.addEventListener('click', function (e) {
        var newLocale = (e.target && e.target.dataset && e.target.dataset.lang) || 'en'
        window.location.assign(window.location.pathname.replace(/\/[a-zA-Z-]+/, '/' + newLocale))
      })
    } else {
      currentLangElement = el
    }
  })

  langPickerTogglerElement.setAttribute('title', currentLangElement.textContent)

  // Remove the current selected language item, because we don't need to choose it
  // any more unless we want to switch to a new language
  langPickerElement.removeChild(currentLangElement.parentNode)

  langPickerTogglerElement.addEventListener('click', function () {
    langPickerElement.classList.toggle('hidden')

    if (langPickerTogglerElement.getAttribute('aria-expanded') === 'true') {
      langPickerTogglerElement.setAttribute('aria-expanded', 'false')
    } else {
      langPickerTogglerElement.setAttribute('aria-expanded', 'true')
    }
  })
})()

;(function () {
  var scrollToTop = document.getElementById('scroll-to-top');

  (window.onscroll = function () {
    window.requestAnimationFrame(function () {
      scrollToTop.style.display = window.pageYOffset > window.innerHeight ? 'block' : 'none'
    })
  })()

  scrollToTop.addEventListener('click', function (e) {
    e.preventDefault()
    window.scrollTo(0, 0)
  })
})()

;(function () {
  var contributorAvatar = document.getElementById('contributor-avatar')
  var contributorUsername = document.getElementById('contributor-username')
  var contributorCommits = document.getElementById('contributor-commits')

  if (!contributorAvatar) {
    return
  }

  var xhr = new window.XMLHttpRequest()
  xhr.responseType = 'json'

  xhr.open('GET', 'https://api.github.com/repos/nodejs/node/contributors?per_page=1')
  xhr.send()
  xhr.onload = function () {
    if (xhr.status !== 200) {
      handleRequestError()
    } else {
      // Get Headers Links last page to generate a random contributor
      var links = linkParser(xhr.getResponseHeader('Link'))
      var randomPage = randomInt(links.last.page) + 1

      // Fetch the contributor
      xhr.open('GET', 'https://api.github.com/repos/nodejs/node/contributors?per_page=1&page=' + randomPage)
      xhr.send()
      xhr.onload = function () {
        if (xhr.status !== 200) {
          handleRequestError()
        } else {
          var contributor = xhr.response[0]
          // Set new values
          contributorAvatar.parentNode.classList.add('active')
          contributorAvatar.src = contributor.avatar_url
          contributorUsername.innerText = contributor.login
          contributorUsername.href = contributor.html_url
          contributorCommits.innerText = contributor.contributions
          contributorCommits.innerText = contributor.contributions + ' contributions'
        }
      }
    }
  }

  function handleRequestError () {
    contributorAvatar.parentNode.remove()
  }

  function linkParser (linkHeader) {
    var regex = /<([^?]+\?per_page=1&[a-z]+=([\d]+))>;[\s]*rel="([a-z]+)"/g
    var array = []
    var object = {}

    while ((array = regex.exec(linkHeader)) !== null) {
      object[array[3]] = {
        url: array[1],
        page: array[2]
      }
    }

    return object
  }

  function randomInt (max) {
    return Math.floor(Math.random() * Math.floor(parseInt(max)))
  }
})()

;(function (d, n) {
  'use strict'

  var osMatch = n.platform.match(/(Win|Mac|Linux)/)
  var os = (osMatch && osMatch[1]) || ''
  var arch = n.userAgent.match(/x86_64|Win64|WOW64/) ||
    n.cpuClass === 'x64' ? 'x64' : 'x86'
  var text = 'textContent' in d ? 'textContent' : 'innerText'
  var buttons = d.querySelectorAll('.home-downloadbutton')
  var downloadHead = d.getElementById('home-downloadhead')
  var dlLocal

  function versionIntoHref (nodeList, filename) {
    var linkEls = Array.prototype.slice.call(nodeList)
    var version
    var el

    for (var i = 0; i < linkEls.length; i++) {
      version = linkEls[i].getAttribute('data-version')
      el = linkEls[i]

      // Windows 64-bit files for 0.x.x need to be prefixed with 'x64/'
      if (os === 'Win' && (version[1] === '0' && arch === 'x64')) {
        el.href += arch + '/'
      }

      el.href += filename.replace('%version%', version)
    }
  }

  if (downloadHead && buttons) {
    dlLocal = downloadHead.getAttribute('data-dl-local')
    switch (os) {
      case 'Mac':
        versionIntoHref(buttons, 'node-%version%.pkg')
        downloadHead[text] = dlLocal + ' macOS (x64)'
        break
      case 'Win':
        versionIntoHref(buttons, 'node-%version%-' + arch + '.msi')
        downloadHead[text] = dlLocal + ' Windows (' + arch + ')'
        break
      case 'Linux':
        versionIntoHref(buttons, 'node-%version%-linux-x64.tar.xz')
        downloadHead[text] = dlLocal + ' Linux (x64)'
        break
    }
  }

  // Windows button on download page
  var winButton = d.getElementById('windows-downloadbutton')
  if (winButton && os === 'Win') {
    var winText = winButton.getElementsByTagName('p')[0]
    winButton.href = winButton.href.replace(/x(86|64)/, arch)
    winText[text] = winText[text].replace(/x(86|64)/, arch)
  }
})(document, navigator)
