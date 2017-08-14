(function($)
{
  function ComboTreeView(el)
  {
    this.el = el;
    this.opened = false;
    this.selected = 0;

    this.init();
    this.hookWP();
  }

  var proto = ComboTreeView.prototype;

  // prepare HTML elements and init content
  proto.init = function()
  {
    var t = this;

    this.el.hide();

    this.el.on('change', function()
    {
      t.selectItem(t.el.val());
    });

    // combobox control
    this.control = $('<div></div>').addClass('comboTreeView').insertAfter(this.el);
    this.controlText = $('<div class="textItem"></div>').appendTo(this.control);

    this.control.on('click', function(e)
    {
      e.preventDefault();
      t.showList();
      return false;
    });

    $('*:not(.comboTreeView,.comboTreeViewList,.scroll)').on('click focus mousewheel DOMMouseScroll', function(e)
    {
      t.hideList();
    });

    this.selectItem(this.el.val());


    $('label[for=' + this.el.attr('id') + ']').on('click', function(e)
    {
      e.preventDefault();
      t.control.trigger('click');
      return false;
    });


    // treeview list
    this.listContainer = $('<div></div>').addClass('comboTreeViewList').css('display', 'none').appendTo($('body'));
    this.list = $('<div></div>').addClass('scroll').appendTo(this.listContainer);

    this.list.on('click', function(e)
    {
      e.stopPropagation();
    });

    this.listContainer.on('mousewheel DOMMouseScroll', function(e)
    {
      e.stopPropagation();
    });

    // parse content from original select box
    var ul = [];
    this.el.find('option').each(function()
    {
      var $t = $(this),
        level = $t.attr('class')?$t.attr('class').replace('level-', ''):0,
        id = $t.attr('value');

      if (level == 0) ul = [];

      if (level > ul.length - 1)
      {
        var u = $('<ul></ul>');
        if (level > 0)
        {
          u.css('display', 'none');
          u.appendTo(ul[level-1].find('li').last().addClass('collapsed'));
        }
        else
          u.appendTo(t.list);

        ul.push(u);
      }
      else
      if (level < ul.length - 1)
        ul.pop(u);

      t.addItem($.trim($t.text()), id, ul[level]);
    });

  }

  // select item
  proto.selectItem = function(id)
  {
    this.controlText.text($.trim(this.el.find('option[value=' + id + ']').text()));
    this.el.val(id);
    this.selected = id;
  }

  // add a new item to tree
  proto.addItem = function(text, id, parent)
  {
    var item = $('<div></div>').attr('data-id', id).text(text),
      li = $('<li></li>').append(item),
      t = this;

    item.on('click', function(e)
    {
      e.preventDefault();
      var $t = $(this);
      t.selectItem($t.attr('data-id'));
      t.hideList();
      return false;
    });

    li.on('click', function(e)
    {
      e.preventDefault();
      var $t = $(this);

      if ($t.hasClass('collapsed'))
      {
        $t.addClass('expanded').removeClass('collapsed');

        $t.find('ul:first').show(200, function()
        {
          var $t = $(this),
            offset = $t.offset(),
            listOffset = t.list.offset();

          if (offset.top - listOffset.top + $t.height() > t.list.height())
            t.list.animate( { scrollTop: t.list.scrollTop() + $t.height() }, 200);
        });
      }
      else
      if ($t.hasClass('expanded'))
      {
        $t.addClass('collapsed').removeClass('expanded');
        $t.find('ul:first').hide(200);
      }

      return false;
    });


    if (typeof parent === 'string' || typeof parent === 'number')
    {
      var parent = t.list.find('[data-id=' + parent + ']');

      if (parent.length > 0)
      {
        var p = parent.parent().find('ul');
        if (p.length > 0)
          parent = p;
        else
          parent = $('<ul></ul>').appendTo(parent.parent().addClass('expanded'));
      }
      else
        parent = t.list.find('ul').first();
    }

    li.appendTo(parent);
  }

  // delete item from the tree
  proto.removeItem = function(id)
  {
    var item = this.list.find('[data-id=' + id + ']').parent(),
      children = item.find('ul').first();

    // if item has some children, move them level up
    if (children.length > 0)
      item.parent().append(children.children());

    var c = item.parent().find('li').length;
    if (c == 1)
    {
      item.parent().parent().closest('li').removeClass('expanded collapsed');
      item.parent().remove();
    }
    else
      item.remove();
  }

  // update item text in the tree
  proto.updateItem = function(id, text)
  {
    this.list.find('[data-id=' + id + ']').text(text);
    this.el.find('option[value=' + id + ']').text(text);
    this.selectItem(this.el.val());
  }

  // find and select current item in tree view
  proto.selectCurrentItem = function()
  {
    this.list.find('div.selected').removeClass('selected');
    this.list.find('[data-id=' + this.el.val() + ']').addClass('selected');
  }

  proto.expandParents = function()
  {
    var o_item = this.list.find('[data-id=' + this.el.val() + ']');

    // expand all parent items
    var item = o_item.parent();
    while(item != null)
    {
      item = item.parent();
      if (item.hasClass('collapsed'))
      {
        item.trigger('click');
      }
      else
      if (item.hasClass('scroll')) item = null;
    }


    var pos = o_item.offset().top - this.list.offset().top + this.list.scrollTop();
    if (pos > this.list.scrollTop() + this.list.height() || pos < this.list.scrollTop())
    {
      this.list.animate( { scrollTop: pos - this.list.height() / 2  }, 200);
    }
  }


  proto.showList = function()
  {
    var offset = this.control.offset(),
      listHeight = this.listContainer.height(),
      windowHeight = $(window).height(),
      controlHeight = this.control.outerHeight(),
      scrollTop = $(document).scrollTop();

    if (listHeight > windowHeight)
      listHeight = windowHeight - 50;

    var halfHeight = listHeight / 2 - controlHeight / 2,
      offsetHeight = 0,
      outerHeight = (windowHeight - (offset.top - scrollTop));

    if (halfHeight > outerHeight - controlHeight / 2)
      offsetHeight = -(halfHeight - outerHeight + controlHeight / 2 + 20);
    else
    if (halfHeight > windowHeight - outerHeight + controlHeight / 2 - 40)
      offsetHeight = -((windowHeight - outerHeight) - halfHeight - controlHeight / 2 - 20);

    this.listContainer.css({
      top: offset.top - halfHeight + offsetHeight,
      left: (offset.left - 20) + 'px',
      'min-width': this.control.outerWidth()-2 + 'px',
      height: listHeight + 'px'
    });

    this.list.css('height', listHeight + 'px');

    if (this.listContainer.outerHeight > ($(window).height() - offset.top + this.control.outerHeight()))
      this.listContainer.css('top', $(window).height() - this.listContainer.outerHeight());

    var t = this;
    this.selectCurrentItem();
    this.listContainer.fadeIn(200, function()
    {
      t.expandParents();
    });
    this.control.addClass('focus');
    this.opened = true;
  }

  proto.hideList = function()
  {
    this.listContainer.hide();
    this.control.removeClass('focus');
    this.opened = false;
  }

  proto.hookWP = function()
  {
    var o_post = $.post,
      t = this;

    $.post = function()
    {
      var query = t.parseQuery(arguments[1]);

      for(var i in arguments)
        if (typeof arguments[i] == 'function')
        {
          var o_cb = arguments[i];
          arguments[i] = function()
          {
            ret = o_cb.apply(this, arguments);

            if (arguments[1] == 'success')
            {
              var response = $(arguments[2].responseXML).find('response').last(),
                action = response.attr('action'),
                term = response.find('term').last(),
                id = term.find('term_id').text(),
                parent = term.find('parent').text(),
                name = term.find('name').text();

              if (typeof action !== 'undefined')
              {
                // new tag added
                if (action.indexOf('add-tag') !== -1)
                  t.addItem(name, id, parent);
              }
              else
              if (query.hasOwnProperty('action'))
              {
                if (query.action == 'delete-tag')
                {
                  t.removeItem(query.tag_ID);
                  t.selectItem(t.el.val());
                }
                else
                if (query.action == 'inline-save-tax')
                {
                  console.log(arguments[2].responseText);
                  t.updateItem(query.tax_ID, $.trim($(arguments[2].responseText).find('a.row-title').text().replace(/—/g, '')));
                }
              }
            }

            return ret;
          }
          break;
        }

      return o_post.apply(this, arguments);
    }
  }

  // helper function to parse query into an object
  proto.parseQuery = function(query)
  {
    var obj = {};

    for(var i = 0, p = query.split('&'), n = p.length; i < n; i++)
    {
      var t = p[i].split('=');
      obj[t[0]] = t[1];
    }

    return obj;
  }

  $.fn.comboTreeView = function()
  {
    return this.filter('select').each(function()
    {
      var $t = $(this);
      $t.data('comboTreeView', new ComboTreeView($t));
    });
  }

})(jQuery);

jQuery(function($)
{
  jQuery('#parent').comboTreeView();
});