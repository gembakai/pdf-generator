const express = require("express");
const wkhtmltopdf = require("wkhtmltopdf");
const app = express();

app.use(express.json()); // Para recibir JSON en las solicitudes

app.post("/generate-pdf", (req, res) => {
    const { html } = req.body; // Recibimos el HTML desde Bubble
    
    if (!html) {
        return res.status(400).json({ error: "HTML is required" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=document.pdf");

    wkhtmltopdf(html, { pageSize: "A4" }).pipe(res);
});

app.listen(3000, () => {
    console.log("PDF Generator running on port 3000");
});
