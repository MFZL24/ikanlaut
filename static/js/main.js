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
    const predictButton = document.getElementById("predictButton");
    const previewImage = document.getElementById("previewImage");
    const previewBox = document.getElementById("previewBox");
    const classificationText = document.getElementById("classificationText");
    const classificationResult = document.getElementById(
      "classificationResult"
    );
    const loadingBar = document.getElementById("loading");
    const progressBar = document.getElementById("progressBar");

    // Drag & Drop Event
    dropArea.addEventListener("dragover", (event) => {
      event.preventDefault();
      dropArea.classList.add("active");
    });

    dropArea.addEventListener("dragleave", () => {
      dropArea.classList.remove("active");
    });

    dropArea.addEventListener("drop", (event) => {
      event.preventDefault();
      dropArea.classList.remove("active");

      if (event.dataTransfer.files.length > 0) {
        fileInput.files = event.dataTransfer.files;
        previewImageFile(fileInput.files[0]);
      }
    });

    // Klik untuk pilih file
    dropArea.addEventListener("click", () => {
      fileInput.click();
    });

    fileInput.addEventListener("change", (event) => {
      if (event.target.files.length > 0) {
        previewImageFile(event.target.files[0]);
      }
    });

    // Preview Gambar
    function previewImageFile(file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        previewImage.src = e.target.result;
        previewBox.classList.remove("d-none"); // Menampilkan preview gambar
      };
      reader.readAsDataURL(file);
    }

    // Prediksi Gambar
    predictButton.addEventListener("click", async () => {
      const file = fileInput.files[0];
      if (!file) {
        alert("Silakan unggah gambar terlebih dahulu.");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      // Tampilkan loading bar
      classificationText.textContent = "Memproses...";
      classificationResult.classList.remove("d-none");
      loadingBar.classList.remove("d-none");

      // Simulasi progres
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        progressBar.style.width = progress + "%";
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 200);

      try {
        const response = await fetch("/predict", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();

        if (response.ok) {
          classificationText.textContent = `Hasil: ${data.prediction}`;
          classificationText.classList.add("text-success");
        } else {
          classificationText.textContent = `Error: ${data.error}`;
          classificationText.classList.add("text-danger");
        }
      } catch (error) {
        classificationText.textContent = "Terjadi kesalahan saat memproses.";
        classificationText.classList.add("text-danger");
      }

      // Sembunyikan loading bar
      setTimeout(() => {
        loadingBar.classList.add("d-none");
        progressBar.style.width = "0%";
      }, 1000);
    });
  });
})();
