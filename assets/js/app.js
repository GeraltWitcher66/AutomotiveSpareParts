/* یدکیار — mockup interactions (design preview only) */
(function () {
  "use strict";

  var FA = "۰۱۲۳۴۵۶۷۸۹";

  function fa(value) {
    return String(value).replace(/\d/g, function (d) {
      return FA[+d];
    });
  }

  function money(n) {
    return fa(Math.round(n).toLocaleString("en-US"));
  }

  function store(key, value) {
    try {
      if (value === undefined) return window.localStorage.getItem(key);
      if (value === null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, value);
    } catch (e) {
      /* storage unavailable — preview still works */
    }
    return null;
  }

  /* ---------------- vehicles ---------------- */
  var VEHICLES = {
    "ایران‌خودرو": {
      "پژو ۲۰۶": ["تیپ ۲", "تیپ ۵", "تیپ ۶", "تیپ ۸"],
      "پژو ۴۰۵": ["GLX", "GLi", "دوگانه‌سوز"],
      "سمند": ["LX", "ELX", "EF7"],
      "پارس": ["ELX", "پارس سال"],
      "رانا": ["پلاس", "LX"],
      "دنا": ["پلاس", "پلاس توربو"],
      "تارا": ["اتوماتیک", "دستی"]
    },
    "سایپا": {
      "پراید ۱۳۱": ["SE", "LE"],
      "پراید ۱۳۲": ["SE", "LE"],
      "تیبا": ["صندوق‌دار", "هاچبک"],
      "ساینا": ["S", "اتوماتیک"],
      "کوییک": ["R", "اتوماتیک"],
      "شاهین": ["G", "اتوماتیک"]
    },
    "مدیران خودرو": {
      "MVM 315": ["اتوماتیک"],
      "آریزو ۵": ["اتوماتیک", "توربو"],
      "تیگو ۷": ["پرو", "اتوماتیک"]
    },
    "کرمان موتور": {
      "جک J5": ["اتوماتیک", "دستی"],
      "ساندرو": ["استپ‌وی", "اتوماتیک"]
    },
    "پارس‌خودرو": {
      "ساندرو": ["استپ‌وی", "اتوماتیک"],
      "تندر ۹۰": ["E2", "پارس تندر"]
    }
  };

  var YEARS = ["۱۳۸۵", "۱۳۸۸", "۱۳۹۰", "۱۳۹۲", "۱۳۹۴", "۱۳۹۵", "۱۳۹۷", "۱۳۹۸", "۱۳۹۹", "۱۴۰۰", "۱۴۰۱", "۱۴۰۲", "۱۴۰۳"];

  var vBrand = document.getElementById("vBrand");
  var vModel = document.getElementById("vModel");
  var vYear = document.getElementById("vYear");
  var vTrim = document.getElementById("vTrim");
  var vChip = document.getElementById("vChip");
  var vChipText = document.getElementById("vChipText");

  function fillSelect(select, items, placeholder) {
    if (!select) return;
    select.innerHTML = "";
    var first = document.createElement("option");
    first.value = "";
    first.textContent = placeholder;
    select.appendChild(first);
    items.forEach(function (item) {
      var option = document.createElement("option");
      option.value = item;
      option.textContent = item;
      select.appendChild(option);
    });
  }

  function showVehicle(label) {
    if (!vChip || !vChipText) return;
    vChipText.textContent = label;
    vChip.classList.add("is-visible");
  }

  if (vBrand) {
    fillSelect(vBrand, Object.keys(VEHICLES), "برند خودرو");

    vBrand.addEventListener("change", function () {
      var models = VEHICLES[vBrand.value] ? Object.keys(VEHICLES[vBrand.value]) : [];
      fillSelect(vModel, models, "مدل");
      fillSelect(vYear, [], "سال");
      fillSelect(vTrim, [], "تیپ / نسخه");
    });

    vModel.addEventListener("change", function () {
      fillSelect(vYear, YEARS, "سال");
      fillSelect(vTrim, [], "تیپ / نسخه");
    });

    vYear.addEventListener("change", function () {
      var trims = (VEHICLES[vBrand.value] && VEHICLES[vBrand.value][vModel.value]) || [];
      fillSelect(vTrim, trims, "تیپ / نسخه");
    });

    var submit = document.getElementById("vSubmit");
    if (submit) {
      submit.addEventListener("click", function () {
        if (!vBrand.value || !vModel.value) {
          if (vBrand) vBrand.focus();
          return;
        }
        var parts = [vModel.value];
        if (vTrim.value) parts.push(vTrim.value);
        var label = parts.join(" ") + (vYear.value ? " — " + vYear.value : "");
        showVehicle(label);
        store(
          "yadakyar_vehicle",
          JSON.stringify({
            label: label,
            brand: vBrand.value,
            model: vModel.value,
            year: vYear.value,
            trim: vTrim.value
          })
        );
        toast("خودروی شما ذخیره شد: " + label);
      });
    }

    var clear = document.getElementById("vClear");
    if (clear) {
      clear.addEventListener("click", function () {
        store("yadakyar_vehicle", null);
        fillSelect(vBrand, Object.keys(VEHICLES), "برند خودرو");
        fillSelect(vModel, [], "مدل");
        fillSelect(vYear, [], "سال");
        fillSelect(vTrim, [], "تیپ / نسخه");
        if (vChip) vChip.classList.remove("is-visible");
      });
    }

    var savedRaw = store("yadakyar_vehicle");
    if (savedRaw) {
      try {
        var saved = JSON.parse(savedRaw);
        if (saved && VEHICLES[saved.brand]) {
          vBrand.value = saved.brand;
          vBrand.dispatchEvent(new Event("change"));
          vModel.value = saved.model;
          vModel.dispatchEvent(new Event("change"));
          vYear.value = saved.year || "";
          vYear.dispatchEvent(new Event("change"));
          if (saved.trim) vTrim.value = saved.trim;
          showVehicle(saved.label);
        }
      } catch (e) {
        store("yadakyar_vehicle", null);
      }
    }
  }

  /* ---------------- toast ---------------- */
  var toastEl = document.querySelector("[data-toast]");
  var toastText = document.querySelector("[data-toast-text]");
  var toastTimer = null;

  function toast(message) {
    if (!toastEl) return;
    if (toastText) toastText.textContent = message;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-on");
    }, 2600);
  }

  /* ---------------- cart badge ---------------- */
  function cartCount() {
    var value = parseInt(store("yadakyar_cart_count") || "3", 10);
    return isNaN(value) ? 3 : value;
  }

  function paintCartCount() {
    var count = cartCount();
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = fa(count);
    });
  }

  paintCartCount();

  document.querySelectorAll("[data-add-to-cart]").forEach(function (button) {
    button.addEventListener("click", function () {
      var qtyBox = button.closest(".buybox") ? button.closest(".buybox").querySelector("[data-qty]") : null;
      var qty = qtyBox ? parseInt(qtyBox.querySelector("[data-qty-value]").textContent.replace(/[^\d۰-۹]/g, "").replace(/[۰-۹]/g, function (d) {
        return FA.indexOf(d);
      }), 10) || 1 : 1;

      store("yadakyar_cart_count", String(cartCount() + qty));
      paintCartCount();

      var card = button.closest(".pcard");
      var titleEl = card ? card.querySelector(".ptitle") : document.querySelector(".pinfo h1");
      var title = titleEl ? titleEl.textContent.trim() : "کالا";
      toast("به سبد خرید اضافه شد: " + title);
    });
  });

  /* ---------------- favorite buttons ---------------- */
  document.querySelectorAll(".fav").forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      button.classList.toggle("is-on");
    });
  });

  /* ---------------- mobile nav ---------------- */
  document.querySelectorAll("[data-burger]").forEach(function (button) {
    button.addEventListener("click", function () {
      var nav = document.querySelector("[data-mobile-nav]");
      if (nav) nav.classList.toggle("is-open");
    });
  });

  /* ---------------- PLP filters on mobile ---------------- */
  document.querySelectorAll("[data-filter-toggle]").forEach(function (button) {
    button.addEventListener("click", function () {
      var side = document.querySelector("[data-plp-side]");
      if (side) side.classList.toggle("is-open");
    });
  });

  /* ---------------- quantity steppers ---------------- */
  document.querySelectorAll("[data-qty]").forEach(function (box) {
    var valueEl = box.querySelector("[data-qty-value]");
    var plus = box.querySelector("[data-qty-plus]");
    var minus = box.querySelector("[data-qty-minus]");
    if (!valueEl) return;

    function read() {
      var digits = valueEl.textContent.replace(/[۰-۹]/g, function (d) {
        return FA.indexOf(d);
      });
      return parseInt(digits.replace(/[^\d]/g, ""), 10) || 1;
    }

    function write(value, notify) {
      valueEl.textContent = fa(value);
      if (notify) document.dispatchEvent(new CustomEvent("qty:change", { detail: { box: box } }));
    }

    if (plus) {
      plus.addEventListener("click", function () {
        write(read() + 1, true);
      });
    }

    if (minus) {
      minus.addEventListener("click", function () {
        write(Math.max(1, read() - 1), true);
      });
    }
  });

  /* ---------------- cart page totals ---------------- */
  var cartWrap = document.querySelector(".cart-wrap");

  function recalcCart() {
    if (!cartWrap) return;

    var items = cartWrap.querySelectorAll(".citem");
    var sumOld = 0;
    var sumFinal = 0;
    var units = 0;

    items.forEach(function (item) {
      var unit = parseInt(item.getAttribute("data-unit") || "0", 10);
      var oldUnit = parseInt(item.getAttribute("data-old-unit") || "0", 10) || unit;
      var qtyEl = item.querySelector("[data-qty-value]");
      var qty = 1;
      if (qtyEl) {
        qty = parseInt(
          qtyEl.textContent.replace(/[۰-۹]/g, function (d) {
            return FA.indexOf(d);
          }),
          10
        ) || 1;
      }

      var lineEl = item.querySelector("[data-line-total]");
      if (lineEl) lineEl.textContent = money(unit * qty);

      sumOld += oldUnit * qty;
      sumFinal += unit * qty;
      units += qty;
    });

    var discount = sumOld - sumFinal;
    var shipping = sumFinal >= 5000000 ? 0 : 95000;
    var total = sumFinal + shipping;

    var bind = function (selector, text) {
      document.querySelectorAll(selector).forEach(function (el) {
        el.textContent = text;
      });
    };

    bind("[data-sum-old]", money(sumOld));
    bind("[data-sum-final]", money(sumFinal));
    bind("[data-discount]", money(discount) + " −");
    bind("[data-ship-cost]", shipping === 0 ? "رایگان" : money(shipping));
    bind("[data-ship-note]", shipping === 0 ? "رایگان" : money(shipping));
    bind("[data-total]", money(total));
    bind("[data-cart-rows]", fa(items.length) + " ردیف");
    bind("[data-cart-items]", fa(items.length) + " کالا · " + fa(units) + " عدد");

    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = fa(units);
    });
    store("yadakyar_cart_count", String(units));
  }

  if (cartWrap) {
    document.addEventListener("qty:change", recalcCart);
    recalcCart();

    cartWrap.querySelectorAll("[data-remove]").forEach(function (button) {
      button.addEventListener("click", function () {
        var item = button.closest(".citem");
        if (!item) return;
        item.style.transition = "opacity .18s";
        item.style.opacity = "0";
        setTimeout(function () {
          item.remove();
          recalcCart();
          toast("کالا از سبد خرید حذف شد");
        }, 180);
      });
    });
  }

  /* ---------------- coupon ---------------- */
  var couponBtn = document.querySelector("[data-coupon]");
  if (couponBtn) {
    couponBtn.addEventListener("click", function () {
      var note = document.querySelector("[data-coupon-note]");
      if (note) note.classList.add("is-on");
      toast("کد تخفیف «YADAK10» اعمال شد");
    });
  }

  /* ---------------- checkout ---------------- */
  var shipList = document.querySelector("[data-ship]");

  function recalcCheckout() {
    if (!shipList) return;
    var summary = document.querySelector(".summary");
    var subtotal = summary ? parseInt(summary.getAttribute("data-subtotal") || "0", 10) : 0;
    var selected = shipList.querySelector("input:checked");
    var ship = selected ? parseInt(selected.getAttribute("data-ship-price") || "0", 10) : 0;

    document.querySelectorAll("[data-ship-cost]").forEach(function (el) {
      el.textContent = ship === 0 ? "رایگان" : money(ship) + " تومان";
    });
    document.querySelectorAll("[data-total]").forEach(function (el) {
      el.textContent = money(subtotal + ship);
    });
  }

  if (shipList) {
    shipList.querySelectorAll(".ship").forEach(function (label) {
      label.addEventListener("click", function () {
        shipList.querySelectorAll(".ship").forEach(function (other) {
          other.classList.remove("is-active");
        });
        label.classList.add("is-active");
        recalcCheckout();
      });
    });
    recalcCheckout();
  }

  document.querySelectorAll("[data-addr] .addr").forEach(function (label) {
    label.addEventListener("click", function () {
      document.querySelectorAll("[data-addr] .addr").forEach(function (other) {
        other.classList.remove("is-active");
      });
      label.classList.add("is-active");
    });
  });

  /* ---------------- tabs ---------------- */
  var tablist = document.querySelector("[data-tabs]");
  if (tablist) {
    tablist.querySelectorAll("[data-tab]").forEach(function (button) {
      button.addEventListener("click", function () {
        var name = button.getAttribute("data-tab");
        tablist.querySelectorAll("[data-tab]").forEach(function (other) {
          other.classList.toggle("is-active", other === button);
        });
        document.querySelectorAll("[data-panel]").forEach(function (panel) {
          panel.classList.toggle("is-active", panel.getAttribute("data-panel") === name);
        });
      });
    });
  }

  /* ---------------- gallery thumbs (real photos) ---------------- */
  var mainImg = document.querySelector("[data-main-img]");
  document.querySelectorAll("[data-src]").forEach(function (thumb) {
    thumb.addEventListener("click", function () {
      var target = thumb.getAttribute("data-src");
      document.querySelectorAll("[data-src]").forEach(function (other) {
        other.classList.toggle("is-active", other === thumb);
      });
      if (mainImg && target) mainImg.setAttribute("src", target);
    });
  });
})();
