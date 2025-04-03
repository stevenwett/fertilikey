<?php
require __DIR__ . '/../../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../..');
$dotenv->load();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Learn about parental leave and fertility benefits across teaching institutions in the US.">
    <title>About | Fertilikey | Find the fertility benefits at ACGME institutions</title>

    <!-- fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Source+Serif+Pro:wght@00;400;600&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=DM+Serif+Text:ital@0;1&display=swap" rel="stylesheet">

    <!-- styles -->
    <link rel="stylesheet" href="/css/main.css?v3">

    <!-- favicons -->
    <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="shortcut icon" href="/favicon.ico" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <meta name="apple-mobile-web-app-title" content="Fertilikey" />
    <link rel="manifest" href="/site.webmanifest" />

    <!-- Open Graph / Facebook -->
    <meta property="og:title" content="About | Fertilikey | Find the fertility benefits at ACGME institutions" />
    <meta property="og:description" content="Learn about parental leave and fertility benefits across teaching institutions in the US." />
    <meta property="og:image" content="https://fertilikey.org/assets/og-image.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="https://fertilikey.org" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Fertilikey" />

    <!-- Twitter Card tags (for Twitter sharing) -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content="https://fertilikey.org/assets/og-image.jpg" />
    <meta name="twitter:title" content="About | Fertilikey | Find the fertility benefits at ACGME institutions" />
    <meta name="twitter:description" content="Learn about parental leave and fertility benefits across teaching institutions in the US." />
</head>

<?php if (isset($_ENV['APP_ENV']) && 'production' === $_ENV['APP_ENV']): ?>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-89SK08WR1C"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-89SK08WR1C');
</script>
<?php endif; ?>

<body>
    <main>
        <div class="container pb-5">
            <div class="row">
                <div class="col-12 col-md-11 col-lg-8">
                    <a href="/">&lsaquo; Back to Search</a>
                    <h1 class="mt-3">About This Project</h1>
                    <p>This ongoing research project is dedicated to consolidating information about parental leave policies and fertility benefits at ACGME-accredited institutions. Our mission is to empower applicants and current trainees by providing comprehensive and easily accessible information, helping them make informed decisions about their training and personal needs.</p>
                    <p>We collect data through direct outreach to institutions and from publicly available resources.</p>
                    <hr />
                    <p>A special thank you to the following volunteers who contributed to this project:</p>
                    <ul>
                        <li>Anisha Chada, MD – Project Lead</li>
                        <li>Melika Deaton, MD – Researcher</li>
                        <li>Aashvi Patel, MD Candidate – Researcher</li>
                        <li>Chloe Denham, MD – Researcher</li>
                        <li>Sheila Rajagopalan, MD Candidate – Researcher</li>
                        <li>Shannon Su, MD Candidate – Data Analyst</li>
                        <li>Heather Hipp, MD – Researcher</li>
                        <li>Gabriela Garcia Nores, MD – Principal Investigator</li>
                        <li>Jennifer Kawwass, MD – Principal Investigator</li>
                        <li>Steven Wett – Website Design and Development</li>
                    </ul>
                    <h2>Contribute to the Project</h2>
                    <p>If you're interested in adding your institution's information to this project or correcting any information, please <a class="text-decoration-underline"href="https://forms.gle/16Ku5nnyKAhPRx449">fill out this form</a>. We encourage residents, fellows, and program leadership to contribute data, to help us create a comprehensive and accurate resource for future trainees.</p>
                    <h2>Looking Forward</h2>
                    <p>We hope to continue expanding this resource to include additional institutions and advocate for improved fertility-related policies across the country.</p>
                </div>
            </div>
        </div>
    </main>

    <footer>
        <div class="container">
            <div class="row align-items-center text-center">
                <div class="col-12">
                <p class="mb-0">&copy; <?= date('Y'); ?> Fertilikey <span class="vertical-divider">&nbsp;&nbsp;|&nbsp;&nbsp;<a href="/about">About</a>&nbsp;&nbsp;|&nbsp;&nbsp;</span> <a href="/privacy">Privacy Policy</a></p>
                </div>
            </div>
        </div>

        <!-- scripts -->
        <script src="/js/main.js"></script>
        <script src="/js/app.js"></script>
    </footer>
</body>
</html>