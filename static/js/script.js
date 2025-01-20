// Variabel global untuk menyimpan instance grafik
let probabilityChart = null;

// Fungsi untuk menghitung faktorial
function factorial(n) {
    if (n === 0 || n === 1) return 1;
    return n * factorial(n - 1);
}

// Fungsi untuk menghitung kombinasi (C(n,r))
function combination(n, r) {
    return factorial(n) / (factorial(r) * factorial(n - r));
}

// Fungsi utama untuk menghitung probabilitas
function calculateProbability() {
    // Mengambil nilai input dari form
    const n = parseInt(document.getElementById('n').value);
    const p = parseFloat(document.getElementById('p').value);
    const k = parseInt(document.getElementById('k').value);

    // Validasi input probabilitas
    if (p < 0 || p > 1) {
        alert('Probabilitas sukses (p) harus antara 0 dan 1');
        return;
    }

    // Mengirim data ke server untuk perhitungan
    fetch('/calculate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ n, p, k })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert('Error: ' + data.error);
            return;
        }
        
        // Memperbarui hasil perhitungan di tampilan
        document.getElementById('exact-result').textContent = data.exact + '%';
        document.getElementById('cumulative-result').textContent = data.cumulative + '%';
        document.getElementById('more-result').textContent = data.more + '%';
        document.getElementById('at-least-result').textContent = data.at_least + '%';
        
        // Memperbarui grafik visualisasi
        updateChart(data.graph_data, k);

        // Memperbarui penjelasan langkah demi langkah
        updateStepByStepSolution(n, k, p);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat menghitung probabilitas');
    });
}

// Fungsi untuk memperbarui penjelasan langkah demi langkah
function updateStepByStepSolution(n, k, p) {
    const solutionDiv = document.getElementById('step-by-step-solution');
    const C = combination(n, k);
    const P_k = Math.pow(p, k);
    const P_nk = Math.pow(1-p, n-k);
    const result = C * P_k * P_nk;

    let solution = `
        <div class="step">
            <h3>Langkah 1: Identifikasi Parameter</h3>
            <p>n = ${n} (total produk dalam flash sale)</p>
            <p>k = ${k} (target penjualan yang diinginkan)</p>
            <p>p = ${p} (probabilitas sukses penjualan per produk)</p>
        </div>

        <div class="step">
            <h3>Langkah 2: Rumus Distribusi Binomial</h3>
            <p>P(X = k) = C(n,k) × p^k × (1-p)^(n-k)</p>
            <p>Rumus ini menghitung probabilitas tepat k sukses dari n percobaan</p>
        </div>

        <div class="step">
            <h3>Langkah 3: Menghitung Kombinasi C(n,k)</h3>
            <p>C(${n},${k}) = ${n}! / (${k}! × (${n}-${k})!)</p>
            <p>C(${n},${k}) = ${C}</p>
        </div>

        <div class="step">
            <h3>Langkah 4: Menghitung Probabilitas Sukses</h3>
            <p>(${p})^${k} = ${P_k.toFixed(6)}</p>
            <p>Ini adalah probabilitas untuk ${k} sukses</p>
        </div>

        <div class="step">
            <h3>Langkah 5: Menghitung Probabilitas Gagal</h3>
            <p>(1-${p})^(${n}-${k}) = ${P_nk.toFixed(6)}</p>
            <p>Ini adalah probabilitas untuk ${n-k} gagal</p>
        </div>

        <div class="step">
            <h3>Langkah 6: Hasil Perhitungan Final</h3>
            <p>${C} × ${P_k.toFixed(6)} × ${P_nk.toFixed(6)} = ${(result * 100).toFixed(4)}%</p>
        </div>

        <div class="step">
            <h3>Interpretasi Hasil:</h3>
            <p>Probabilitas tepat menjual ${k} produk dari total ${n} produk flash sale adalah ${(result * 100).toFixed(2)}%</p>
            <p>Hasil ini mempertimbangkan probabilitas sukses per produk sebesar ${p * 100}%</p>
        </div>
    `;

    solutionDiv.innerHTML = solution;
}

// Fungsi untuk memperbarui grafik visualisasi
function updateChart(data, k) {
    const ctx = document.getElementById('probabilityChart').getContext('2d');
    
    // Hapus grafik sebelumnya jika ada
    if (probabilityChart) {
        probabilityChart.destroy();
    }
    
    // Membuat array warna dengan highlight pada nilai k
    const backgroundColor = data.map((point, index) => 
        index === parseInt(k) ? 'rgba(255, 107, 0, 0.8)' : 'rgba(255, 107, 0, 0.2)'
    );

    // Membuat grafik baru
    probabilityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(point => point.x),
            datasets: [{
                label: 'Probabilitas',
                data: data.map(point => (point.y * 100).toFixed(2)),
                backgroundColor: backgroundColor,
                borderColor: '#ff6b00',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Probabilitas (%)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Jumlah Penjualan Sukses'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Distribusi Probabilitas Penjualan Flash Sale',
                    color: '#ff6b00',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    labels: {
                        color: '#ff6b00'
                    }
                }
            }
        }
    });
}

// Event listener untuk validasi input
document.getElementById('p').addEventListener('change', validateInputs);

// Fungsi validasi input
function validateInputs() {
    const p = parseFloat(document.getElementById('p').value);
    
    if (p < 0) {
        document.getElementById('p').value = 0;
    } else if (p > 1) {
        document.getElementById('p').value = 1;
    }
}