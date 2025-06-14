(function () {
  "use strict";

  /**
   * Efek perubahan background header saat di-scroll
   */
  function toggleHeaderBackground() {
    let header = document.getElementById("header");
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }
  window.addEventListener("scroll", toggleHeaderBackground);
  window.addEventListener("load", toggleHeaderBackground);

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector(".scroll-top");

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100
        ? scrollTop.classList.add("active")
        : scrollTop.classList.remove("active");
    }
  }
  scrollTop.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  window.addEventListener("load", toggleScrollTop);
  document.addEventListener("scroll", toggleScrollTop);

  /**
   * Preloader
   */
  const preloader = document.querySelector("#preloader");
  if (preloader) {
    window.addEventListener("load", () => {
      preloader.remove();
    });
  }

  /**
   * Smooth scrolling untuk anchor link
   */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 50,
          behavior: "smooth",
        });
      }
    });
  });

  /**
   * Inisialisasi AOS (Animate On Scroll)
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: "ease-in-out",
      once: true,
      mirror: false,
    });
  }
  window.addEventListener("load", aosInit);

  /**
   * Upload Gambar & Prediksi
   */
  document.addEventListener("DOMContentLoaded", function () {
    const dropArea = document.getElementById("dropArea");
    const fileInput = document.getElementById("fileInput");
    const previewBox = document.getElementById("previewBox");
    const previewImage = document.getElementById("previewImage");
    const classificationResult = document.getElementById(
      "classificationResult"
    );
    const classificationText = document.getElementById("classificationText");
    const predictButton = document.getElementById("predictButton");
    const loading = document.getElementById("loading");

    // Drag & Drop
    dropArea.addEventListener("click", () => fileInput.click());

    dropArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropArea.classList.add("bg-light");
    });

    dropArea.addEventListener("dragleave", () => {
      dropArea.classList.remove("bg-light");
    });

    dropArea.addEventListener("drop", (e) => {
      e.preventDefault();
      dropArea.classList.remove("bg-light");
      const file = e.dataTransfer.files[0];
      fileInput.files = e.dataTransfer.files;
      previewImageFile(file);
    });

    fileInput.addEventListener("change", function () {
      const file = fileInput.files[0];
      previewImageFile(file);
    });

    function previewImageFile(file) {
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          previewImage.src = e.target.result;
          previewBox.classList.remove("d-none");
        };
        reader.readAsDataURL(file);
      }
    }

    document
      .getElementById("uploadForm")
      .addEventListener("submit", function (e) {
        e.preventDefault();

        const file = fileInput.files[0];
        if (!file) {
          alert("Silakan pilih gambar terlebih dahulu.");
          return;
        }

        loading.classList.remove("d-none");
        classificationResult.classList.add("d-none");

        const formData = new FormData();
        formData.append("image", file);

        fetch("/predict", {
          method: "POST",
          body: formData,
        })
          .then((res) => res.json())
          .then((data) => {
            loading.classList.add("d-none");
            classificationResult.classList.remove("d-none");

            if (data.prediction) {
              classificationText.innerText = `✅ ${data.prediction}`;
            } else if (data.error) {
              classificationText.innerText = `❌ Gagal memproses gambar: ${data.error}`;
            } else {
              classificationText.innerText = "❌ Gagal memproses gambar.";
            }
          })
          .catch((err) => {
            loading.classList.add("d-none");
            classificationResult.classList.remove("d-none");
            classificationText.innerText = "❌ Terjadi kesalahan server.";
            console.error("Error:", err);
          });
      });
  });
})();
