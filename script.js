function toggleMode() {
    document.body.classList.toggle("dark-mode");
    const modeToggle = document.getElementById("modeToggle");
    modeToggle.textContent = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";
}

window.onload = function () {
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDarkScheme) {
        document.body.classList.add("dark-mode");
        document.getElementById("modeToggle").textContent = "☀️";
    }
    document.getElementById("modeToggle").addEventListener("click", toggleMode);

    const url = "https://store.montu.uk/products.json?limit=250";

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const products = data.products;
            const tableBody = document.querySelector("#stockTable tbody");
            let stockData = [];
            let brands = {};
            let packSizes = new Set();

            products.forEach(product => {
                const title = product.title || "Unknown";
                let stockAvailability = "Out Of Stock";
                
                if (product.variants.some(variant => variant.available)) {
                    stockAvailability = "In Stock";
                }
                
                if (product.tags.includes("no_new_rqst")) {
                    stockAvailability = "No New Requests";
                } else if (product.tags.includes("coming_soon")) {
                    stockAvailability = "Coming Soon";
                }

                const price = product.variants.length > 0 ? parseFloat(product.variants[0].price) : "N/A";
                const thcMatch = product.body_html.match(/THC (\d+\.?\d*)%/);
                const cbdMatch = product.body_html.match(/CBD (\d+\.?\d*)%?/);
                const thc = thcMatch ? parseFloat(thcMatch[1]) : "N/A";
                const cbd = cbdMatch ? parseFloat(cbdMatch[1]) : "N/A";
                
                stockData.push({
                    stockAvailability, title, thc, cbd, price
                });
            });

            function renderTable() {
                const stockAvailabilityFilter = document.querySelector("[data-column='stockAvailability']").value;
                const thcFilter = document.querySelector("#thc").value;
                const cbdFilter = document.querySelector("#cbd").value;
                const searchFilter = document.querySelector("#search").value.toLowerCase();
                const tableBody = document.querySelector("#stockTable tbody");
                tableBody.innerHTML = "";
            
                stockData.forEach(stock => {
                    const matchesStockAvailability = !stockAvailabilityFilter || stock.stockAvailability === stockAvailabilityFilter;
                    const matchesThc = !thcFilter || (thcFilter === "0-10" && stock.thc >= 0 && stock.thc <= 10) ||
                                       (thcFilter === "10-20" && stock.thc > 10 && stock.thc <= 20) ||
                                       (thcFilter === "20-30" && stock.thc > 20 && stock.thc <= 30) ||
                                       (thcFilter === "30+" && stock.thc > 30);
            
                    let matchesCbd = true;
                    if (cbdFilter === "Yes") {
                        matchesCbd = stock.cbd >= 1;
                    } else if (cbdFilter === "No") {
                        matchesCbd = stock.cbd === "N/A";
                    }
            
                    const matchesSearch = !searchFilter || stock.title.toLowerCase().includes(searchFilter);
            
                    if (matchesStockAvailability && matchesThc && matchesCbd && matchesSearch) {
                        let statusClass = "";
                        switch (stock.stockAvailability) {
                            case "In Stock":
                                statusClass = "inStock";
                                break;
                            case "Out Of Stock":
                                statusClass = "outOfStock";
                                break;
                            case "No New Requests":
                                statusClass = "noNewRequests";
                                break;
                            case "Coming Soon":
                                statusClass = "comingSoon";
                                break;
                            default:
                                statusClass = "";
                                break;
                        }
            
                        let row = `<tr>
                            <td class="status-cell ${statusClass}">${stock.stockAvailability}</td>
                            <td>${stock.title}</td>
                            <td>${stock.thc}</td>
                            <td>${stock.cbd}</td>
                            <td>£${stock.price !== "N/A" ? stock.price.toFixed(2) : "N/A"}</td>
                        </tr>`;
                        tableBody.innerHTML += row;
                    }
                });
            }

            document.querySelectorAll(".filter").forEach(element => {
                element.addEventListener("change", renderTable);
                element.addEventListener("input", renderTable);
            });
            renderTable();
        })
        .catch(error => console.error("Error fetching product data:", error));
};