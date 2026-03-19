<?php
/**
 * SkyCast Functions & Definitions
 *
 * @package skycast
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'SKYCAST_VERSION', '1.0.0' );

/* ─── Theme setup ─── */
function skycast_setup() {
    add_theme_support( 'title-tag' );
    add_theme_support( 'html5', [ 'search-form','comment-form','comment-list','gallery','caption','script','style' ] );
    add_theme_support( 'custom-background' );
    add_theme_support( 'customize-selective-refresh-widgets' );
    load_theme_textdomain( 'skycast', get_template_directory() . '/languages' );
}
add_action( 'after_setup_theme', 'skycast_setup' );

/* ─── Enqueue assets ─── */
function skycast_scripts() {
    // Google Fonts
    wp_enqueue_style(
        'skycast-fonts',
        'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;600;700;800&display=swap',
        [],
        null
    );

    // Main dashboard CSS
    wp_enqueue_style(
        'skycast-style',
        get_template_directory_uri() . '/assets/css/skycast.css',
        [ 'skycast-fonts' ],
        SKYCAST_VERSION
    );

    // Live dashboard logic
    wp_enqueue_script(
        'skycast-app',
        get_template_directory_uri() . '/assets/js/skycast.js',
        [],
        SKYCAST_VERSION,
        true
    );
}
add_action( 'wp_enqueue_scripts', 'skycast_scripts' );

/* ─── PWA & Manifest ─── */
function skycast_pwa_meta() {
    echo '<link rel="manifest" href="' . get_template_directory_uri() . '/manifest.json">' . "\n";
    echo '<meta name="theme-color" content="#0b0f1a">' . "\n";
}
add_action( 'wp_head', 'skycast_pwa_meta' );

/* ─── Service Worker registration ─── */
function skycast_pwa_script() {
    ?>
    <script>
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('<?php echo get_template_directory_uri(); ?>/sw.js')
                .catch(err => console.log('SW registration failed:', err));
        });
    }
    </script>
    <?php
}
add_action( 'wp_footer', 'skycast_pwa_script', 100 );

/* ─── Remove admin bar from front-end (keeps dashboard clean) ─── */
add_filter( 'show_admin_bar', '__return_false' );

/* ─── Custom page title ─── */
function skycast_wp_title( $title ) {
    return 'SkyCast — Premium Weather Dashboard';
}
add_filter( 'pre_get_document_title', 'skycast_wp_title' );

/* ─── Add meta description ─── */
function skycast_meta_description() {
    echo '<meta name="description" content="A beautiful real-time weather dashboard. Current conditions, 24-hour forecast, 7-day outlook, AQI, UV index and more." />' . "\n";
    echo '<meta name="viewport" content="width=device-width, initial-scale=1.0" />' . "\n";
}
add_action( 'wp_head', 'skycast_meta_description', 1 );
