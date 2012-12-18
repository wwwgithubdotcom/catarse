CATARSE.ProjectsShowView = Backbone.View.extend({

  initialize: function() {
    _.bindAll(this, "bestInPlaceEvents", "VideoEmbed", "showUpNewRewardForm","render", "BackerView", "BackersView", "about", "updates", "backers", "comments", "embed", "isValid", "backWithReward")
    CATARSE.router.route("", "index", this.about)
    CATARSE.router.route("about", "about", this.about)
    CATARSE.router.route("updates", "updates", this.updates)
    CATARSE.router.route(/updates\/\d+/, "updates", this.updates)
    CATARSE.router.route("backers", "backers", this.backers)
    CATARSE.router.route("comments", "comments", this.comments)
    CATARSE.router.route("statistics", "statistics", this.statistics)
    CATARSE.router.route("embed", "embed", this.embed)

    this.$('a.destroy_update').live('ajax:beforeSend', function(event, data){
      $(event.target).next('.deleting_update').show();
    });

    var that = this;
    this.$('a.destroy_update').live('ajax:success', function(event, data){
      var target = $('.updates_wrapper');
      target.html(data);
      that.$('a#updates_link .count').html(' (' + that.$('.updates_wrapper ul.collection_list > li').length + ')');
      $(event.target).next('.deleting_update').hide();
    });

    this.project = new CATARSE.Project($('#project_description').data("project"))

    var ve = new this.VideoEmbed({model: this.project});
    ve.render();

    this.render()
    this.bestInPlaceEvents();


    // Redirect to #updates anchor in case we come through a link to an update 
    if(window.location.search.match(/update_id/)){
      window.location.hash = 'updates';
    }
  },

  events: {
    "click #show_formatting_tips": "showFormattingTips",
    "keyup form input[type=text],textarea": "validate",
    "click #project_link": "selectTarget",
    "click #project_embed textarea": "selectTarget",
    "click #rewards .clickable": "backWithReward",
    "click #rewards .clickable_owner span.avaliable": "backWithReward",
    "click .add_new_reward": "showUpNewRewardForm"
  },

  bestInPlaceEvents: function() {
    var _this = this;

    $('.video .best_in_place').bind('ajax:success', function(data) {
      _this.project.fetch({wait: true,
        success: function(model, response) {
          var video_embed = new _this.VideoEmbed({model: model});
          video_embed.render();
        }
      });
    });

    $('.maximum_backers .best_in_place').bind('ajax:success', function(data) {
      var data_url = $(data.currentTarget).data('url')
      var reward_id = parseInt(data_url.split("/").reverse()[0]);
      console.log(reward_id);
      var reward = new CATARSE.Reward({id: reward_id})

      reward.fetch({wait: true,
        success: function(model, response){
          var backers_label = new _this.MaximumBackersLabel({model: model})
          backers_label.render();
        }
      });
    });
  },

  showUpNewRewardForm: function(event) {
    event.preventDefault();
    $(event.currentTarget).fadeOut('fast');
    $('.new_reward_content').fadeIn('fast');
  },

  MaximumBackersLabel: Backbone.View.extend({
    render: function() {
      $('.maximum_backers', '#reward_'+this.model.id).empty().html(_.template($('#project_reward_maximum_backers_label').html(), this.model.toJSON()));
    }
  }),

  VideoEmbed: Backbone.View.extend({
    render: function() {
      $('#iframeVideo').empty().html(_.template($('#project_video_embed').html(), this.model.toJSON()));
    },
  }),

  UpdatesForm: Backbone.View.extend({
    el: 'form#new_update',
    events: {
      "click #update_submit" : "submit",
      "keyup #project_updates #update_comment" : "validate_comment"
    },

    initialize: function() {
      _.bindAll(this);
      this.loading = this.$('.loading_updates');
    },

    submit: function(){
      this.validate_comment()
      var that = this;
      var form = $(this.el);
      that.loading.show();
      $.post(form.prop('action'), form.serialize(), null, 'html')
        .success(function(data){
          var target = $('.updates_wrapper');
          target.html(data);
          $('a#updates_link .count').html(' (' + $('.updates_wrapper ul.collection_list > li').length + ')');
          that.loading.hide();
          that.el.reset();
        });
      return false;
    },
    validate_comment: function(el){
      var target = $("#project_updates #update_comment");
      if(target.val() == ''){
        target.addClass('error');
        target.removeClass('ok');
      }else{
        target.removeClass('error');
        target.addClass('ok');
      }
    }
  }),

  BackerView: CATARSE.ModelView.extend({
    template: function(vars){
      return $('#backer_template').html()
    }
  }),

  BackersView: CATARSE.PaginatedView.extend({
		template: function(vars){
      return $('#backers_template').html()
    },
    emptyTemplate: function(){
      return $('#empty_backers_template').html()
    }
  }),

  about: function() {
    this.selectItem("about")
  },

  statistics: function() {
    this.selectItem("statistics")
    chart = new Highcharts.Chart({
      chart: {
        renderTo: 'container',
        type: 'line',
        marginRight: 130,
        marginBottom: 25
      },
      title: {
        text: 'Monthly Average Temperature',
        x: -20 //center
      },
      subtitle: {
        text: 'Source: WorldClimate.com',
        x: -20
      },
      xAxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      },
      yAxis: {
        title: {
          text: 'Temperature (°C)'
        },
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080'
        }]
      },
      tooltip: {
        formatter: function() {
          return '<b>'+ this.series.name +'</b><br/>'+
            this.x +': '+ this.y +'°C';
        }
      },
      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'top',
        x: -10,
        y: 100,
        borderWidth: 0
      },
      series: [{
        name: 'Tokyo',
        data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
      }, {
        name: 'New York',
        data: [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8, 24.1, 20.1, 14.1, 8.6, 2.5]
      }, {
        name: 'Berlin',
        data: [-0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6, 17.9, 14.3, 9.0, 3.9, 1.0]
      }, {
        name: 'London',
        data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
      }]
    });
  },

  updates: function() {
    this.selectItem("updates")
    this.updatesForm = new this.UpdatesForm();
    this.$("#project_updates [type=submit]").removeProp('disabled')
  },

  comments: function() {
    this.selectItem("comments")
  },

  backers: function() {
    this.selectItem("backers")
    this.backersView = new this.BackersView({
      modelView: this.BackerView,
      collection: new CATARSE.Backers({url: '/' + CATARSE.locale + '/projects/' + this.project.id + '/backers'}),
      loading: this.$("#loading"),
      el: this.$("#project_backers")
    })
  },

  embed: function(){
    this.$('#embed_overlay').show()
    this.$('#project_embed').fadeIn()
  },

  selectItem: function(item) {
    this.$('#project_embed').hide()
    this.$('#embed_overlay').hide()
    this.$('#loading img').hide()
    this.$("#project_content .content").hide()
    this.$("#project_content #project_" + item + ".content").show()
    var link = this.$("#project_menu #" + item + "_link")
    this.$('#project_menu a').removeClass('selected')
    link.addClass('selected')
    FB.XFBML.parse();
  },

  showFormattingTips: function(event){
    event.preventDefault()
    this.$('#show_formatting_tips').hide()
    this.$('#formatting_tips').slideDown()
  },

  isValid: function(form){
    var valid = true
    form.find('input[type=text],textarea').each(function(){
      if($(this).parent().hasClass('required') && $.trim($(this).val()) == "") {
        valid = false
      }
    })
    return valid
  },

  validate: function(event){
    var form = $(event.target).parentsUntil('form')
    var submit = form.find('[type=submit]')
    if(this.isValid(form))
      submit.attr('disabled', false)
    else
      submit.attr('disabled', true)
  },

  selectTarget: function(event){
    event.preventDefault()
    $(event.target).select()
  },

  backWithReward: function(event){
    var element = $(event.target)
    if(element.is('a') || element.is('textarea') || element.is('button'))
      return true
    if(!element.is('li'))
      element = element.parentsUntil('li')
    var url = element.find('input[name="url"][type=hidden]').val()
    window.location.href = url;
    //CATARSE.requireLogin(event, url)
  },

  requireLogin: function(event) {
    CATARSE.requireLogin(event)
  }
})
