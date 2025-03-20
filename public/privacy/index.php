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
    <meta name="description" content="">
    <title>Fertilikey</title>

    <!-- fonts -->

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
            <a href="/">&lsaquo; Back to Home</a>
            <h1>Privacy Policy</h1>
            <h2>Overview</h2>
            <p>FertiliKey ("we," "us," or "our") operates the website https://fertilikey.org (the "Site"), which provides information about parental leave and fertility benefits across teaching institutions in the United States. This Privacy Policy explains how we collect, use, and share information about visitors to our Site.</p>
            <h2>Information We Collect</h2>
            <h3>Information You Provide to Us</h3>
            <p>We do not require you to create an account or submit personal information to use our Site. However, if we offer any contact forms, surveys, or feedback mechanisms, you may voluntarily provide information such as:</p>
            <ul>
            <li>Name</li>
            <li>Email address</li>
            <li>Professional affiliation</li>
            <li>Comments or feedback</li>
            </ul>

            <h3>Information We Collect Automatically</h3>
            <p>When you visit our Site, we automatically collect certain information about your device and usage through Google Analytics, including:</p>
            <ul>
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Operating system</li>
            <li>Date and time of your visit</li>
            <li>Pages viewed</li>
            <li>Time spent on pages</li>
            <li>Referring website</li>
            <li>General geographic location (city/country level)</li>
            </ul>

            <h2>How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
            <li>Provide, maintain, and improve our Site</li>
            <li>Understand how visitors use our Site</li>
            <li>Analyze usage patterns and trends</li>
            <li>Develop new features and functionality</li>
            <li>Protect the security of our Site</li>
            </ul>

            <h2>Cookies and Similar Technologies</h2>
            <p>Our Site uses Google Analytics, which places cookies on your device to help us analyze how users interact with our Site. A cookie is a small text file stored on your device. You can configure your browser to refuse cookies, but this may limit your ability to use some features of our Site.</p>
            <p>Google Analytics collects information anonymously and reports website trends without identifying individual visitors. For more information about Google Analytics, please visit <a href="https://policies.google.com/privacy" target="_blank">Google's Privacy Policy</a>.</p>

            <h2>Data Sharing and Disclosure</h2>
            <p>We do not sell your personal information to third parties. We may share information in the following circumstances:</p>
            <ul>
            <li>With service providers who help us operate our Site (such as Google Analytics)</li>
            <li>To comply with legal obligations</li>
            <li>To protect the rights, property, or safety of FertiliKey, our users, or others</li>
            </ul>

            <h2>Data Security</h2>
            <p>We implement reasonable security measures to protect the information we collect. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>

            <h2>Your Rights</h2>
            <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
            <ul>
            <li>Access to the information we have about you</li>
            <li>Correction of inaccurate information</li>
            <li>Deletion of your information</li>
            <li>Restriction of processing</li>
            <li>Data portability</li>
            <li>Objection to processing</li>
            </ul>
            <p>To exercise any of these rights, please contact us using the information provided below.</p>

            <h2>Children's Privacy</h2>
            <p>Our Site is not directed to children under 13, and we do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us.</p>

            <h2>Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the effective date.</p>

            <h2>Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at: [Insert preferred contact method/information]</p>

            <h2>Effective Date</h2>
            <p>This Privacy Policy is effective as of March 20, 2025.</p>
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