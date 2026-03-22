<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

$name = trim($input['name'] ?? '');
$email = trim($input['email'] ?? '');
$company = trim($input['company'] ?? '');
$message = trim($input['message'] ?? '');
$lang = $input['lang'] ?? 'ru';

if (empty($name) || empty($email) || empty($message)) {
    echo json_encode(['success' => false, 'message' => $lang === 'ru' ? 'Заполните все поля' : 'Please fill all fields']);
    exit;
}

$to = 'info@quantumenergy.com';
$subject = $lang === 'ru' ? 'Новая заявка с сайта QUANTUM ENERGY' : 'New application from QUANTUM ENERGY';

$body = "
<html>
<head><meta charset='UTF-8'></head>
<body style='font-family: Arial, sans-serif;'>
<h2>" . ($lang === 'ru' ? 'Новая заявка' : 'New Application') . "</h2>
<p><strong>" . ($lang === 'ru' ? 'Имя:' : 'Name:') . "</strong> $name</p>
<p><strong>Email:</strong> $email</p>
<p><strong>" . ($lang === 'ru' ? 'Компания:' : 'Company:') . "</strong> " . ($company ?: ($lang === 'ru' ? 'не указана' : 'not specified')) . "</p>
<p><strong>" . ($lang === 'ru' ? 'Сообщение:' : 'Message:') . "</strong><br>$message</p>
<p><strong>" . ($lang === 'ru' ? 'Язык:' : 'Language:') . "</strong> " . ($lang === 'ru' ? 'Русский' : 'English') . "</p>
</body>
</html>";

$headers = [
    'MIME-Version: 1.0',
    'Content-type: text/html; charset=utf-8',
    'From: Quantum Energy <noreply@quantumenergy.com>',
    'Reply-To: ' . $email
];

$mailSent = mail($to, $subject, $body, implode("\r\n", $headers));

if ($mailSent) {
    echo json_encode(['success' => true, 'message' => $lang === 'ru' ? 'Заявка отправлена' : 'Application sent']);
} else {
    echo json_encode(['success' => false, 'message' => $lang === 'ru' ? 'Ошибка отправки' : 'Sending error']);
}