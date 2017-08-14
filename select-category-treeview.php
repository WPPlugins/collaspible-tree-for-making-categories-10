<?php
/*
Plugin Name: Select Category TreeView
Plugin URI: http://wikidownload.com/wordpress-category-tree-making-categories-plugin-1-0/
Description: Adds a tree view combobox on the Add/Edit Category page
Author: Hefinator
Version: 0.0.1
Author URI: http://wikidownload.com
*/


class SelectCategoryTreeView
{
  const version = '0.0.1';

  public function __construct()
  {
    if (is_admin())
    {
      add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));
    }

    // on activation/uninstallation hooks
    register_activation_hook(__FILE__, array($this, 'activation'));
    register_uninstall_hook(__FILE__, array(__class__, 'uninstall'));
  }

  public function activation()
  {
  }

  static function uninstall()
  {
  }

  public function admin_enqueue_scripts($hook)
  {
    $screen = get_current_screen();

    if ($screen->id == 'edit-category')
    {
      $url = plugins_url('', __FILE__);

      wp_enqueue_style(__class__, $url.'/styles.css', array(), self::version, 'all');
      wp_enqueue_script(__class__, $url.'/comboTreeView.js', array('jquery'), self::version, false);
    }
  }

}

new SelectCategoryTreeView();