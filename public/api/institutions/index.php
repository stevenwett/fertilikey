<?php
// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Get the base directory and load environment variables
// Adjust the directory depth based on the actual location
$base_dir = dirname(dirname(dirname(__DIR__)));
require_once $base_dir . '/vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable($base_dir);
$dotenv->load();

// Response structure
$response = [
    'message' => '',
    'status' => 0,
    'data' => []
];

try {
    // Database configuration
    $db_host = $_ENV['DB_HOST'] ?? 'localhost';
    $db_user = $_ENV['DB_USER'] ?? 'root';
    $db_password = $_ENV['DB_PASSWORD'] ?? '';
    $db_name = $_ENV['DB_NAME'] ?? 'fertilikey';
    
    // Create database connection
    $conn = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Query to fetch institutions
    $stmt = $conn->prepare("SELECT * FROM institutions");
    $stmt->execute();
    
    // Fetch all institutions
    $institutions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Clean up any values that are just dashes or en dashes
    $institutions = array_map(function ($institution) {
        foreach ($institution as $key => $value) {
            if (is_string($value)) {
                $trimmed = trim($value);
                if ($trimmed === '-' || $trimmed === '–') {
                    $institution[$key] = '';
                }
            }
        }
        return $institution;
    }, $institutions);
    
    // Set success response
    $response['message'] = 'Institutions retrieved successfully';
    $response['status'] = 200;
    $response['data'] = $institutions;
    
} catch(PDOException $e) {
    // Set error response
    $response['message'] = 'Failed to fetch institutions: ' . $e->getMessage();
    $response['status'] = 500;
    http_response_code(500);
} catch(Exception $e) {
    // Handle other exceptions
    $response['message'] = 'An error occurred: ' . $e->getMessage();
    $response['status'] = 500;
    http_response_code(500);
}

// Return JSON response
echo json_encode($response);