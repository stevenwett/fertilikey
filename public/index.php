<?php
require __DIR__ . '/../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->load();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Learn about parental leave and fertility benefits across teaching institutions in the US.">
    <title>Find the fertility benefits at ACGME institutions</title>

    <!-- fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Source+Serif+Pro:wght@00;400;600&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=DM+Serif+Text:ital@0;1&display=swap" rel="stylesheet">

    <!-- styles -->
    <link rel="stylesheet" href="/css/main.css">

    <!-- favicons -->
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
            <div class="row justify-content-center">
                <div class="col-12 col-md-10 col-lg-8 col-xl-7">
                    <header class="text-center mb-4">
                        <h1>Find the fertility benefits at ACGME institutions</h1>
                        <p>Learn about parental leave and fertility benefits across teaching institutions in the US.</p>
                    </header>
                    <hr />
                    <div id="react-app-root"></div>
                </div>
            </div>
        </div>
    </main>

    <footer>
        <div class="container">
            <div class="row align-items-center text-center">
                <div class="col-12">
                    <p class="mb-0">&copy; <?= date('Y'); ?> Fertilikey <span class="vertical-divider">&nbsp;&nbsp;|&nbsp;&nbsp;</span> <a href="/privacy">Privacy Policy</a></p>
                </div>
            </div>
        </div>

        <!-- scripts -->
        <script src="/js/main.js"></script>
        <script src="/js/app.js"></script>
    </footer>
</body>
</html>