Vue.use(VueRouter);

const vr_quickrules = function() {
  return $.ajax("static/quickrules.html").then(function(templateHtml) {
    return {template: templateHtml};
  });
};

const vr_sheet = function() {
  return $.ajax("static/sheet.html").then(function(templateHtml) {
    return {
      data: function() {
        return {
          character: null,
          aptitudes,
          base64export: null,
          rolls: []
        };
      },
      methods: {
        new_morph_trait(type){
          this.character.morph_traits.push(new Trait(null,type));
        },
        new_ego_trait(type){
          this.character.ego_traits.push(new Trait(null,type));
        },
        new_morph_ware(){
          this.character.ware.push(new InvWare());
        },
        new_item(){
          this.character.items.push(new InvItem());
        },
        new_ranged_wep(){
          this.character.weapons_ranged.push(new InvRangedWep(null,"Ranged Weapons"));
        },
        new_melee_wep(){
          this.character.weapons_melee.push(new InvWep(null,"Melee Weapons"));
        },
        new_armor(){
          this.character.armors.push(new InvArmor());
        },
        new_bot(){
          this.character.bots.push(new InvBot());
        },
        new_botware(bot){
          bot.ware.push(new InvWare());
        },
        new_vehicle(){
          this.character.vehicles.push(new InvVehicle());
        },
        new_vehicleware(vehicle){
          vehicle.ware.push(new InvWare());
        },
        new_skill(){
          this.character.skills.push(new Skill());
        },
        add_item_mod(item,event){
          item.mods.push(prompt("Please enter the new mod:", ""));
        },
        rem_item_mod(item,mod,event){
          var indexof = item.mods.indexOf(mod);
          item.mods.splice(indexof, 1);
        },
        add_skill_spec(skill,event){
          skill.specializations.push(prompt("Please enter the new specialization:", ""));
        },
        rem_skill_spec(skill,spec,event){
          var indexof = skill.specializations.indexOf(spec);
          skill.specializations.splice(indexof, 1);
        },
        new_psi_event(){
          this.character.influence_events.push({event:"<Input Event Info>"});
        },
        new_psi_sleight(){
          this.character.sleights.push(new Sleight());
        },
        cycle_morph_type(){
          var index = -1;
          morph_types.find( (el,eli) => {
            if(el.name == this.character.morph_type){
              index = eli;
              return true; //We don't care about the object tbh
            }
          });

          //Found
          if(index >= 0 && index+1 < morph_types.length){
            this.character.morph_type = morph_types[index+1].name;
            this.character.morph_bio = morph_types[index+1].biological;
          } else {
            this.character.morph_type = morph_types[0].name;
            this.character.morph_bio = morph_types[0].biological;
          }
        },
        roll(target,reason){
          var logged_roll = {
            reason,
            original_target: target,
            modified_target: null,
            roll: null,
            notes: []
          };

          if(this.character.traumas_taken){
            let penalty = this.character.traumas_taken*-10;
            target += penalty;
            logged_roll.notes.push(`Penalty of ${penalty} due to ${this.character.traumas_taken} traumas!`);
          }

          if(this.character.wounds_taken){
            let penalty = this.character.wounds_taken*-10;
            target += penalty;
            logged_roll.notes.push(`Penalty of ${penalty} due to ${this.character.wounds_taken} wounds!`);
          }
          
          logged_roll.modified_target = target;

          logged_roll.roll = roll_dice(target);
          
          this.rolls.push(logged_roll);

          $('#sheet-rolls').modal('show');

          console.log(logged_roll);

        },
        default_skills(){
          this.character.skills = [
          new Skill("Athletics","SOM",0,0,true),
          new Skill("Deceive","SAV",0,0,true),
          new Skill("Fray","REF",0,0,true),
          new Skill("Free Fall","REF",0,0,true),
          new Skill("Guns","REF",0,0,true),
          new Skill("Infiltrate","REF",0,0,true),
          new Skill("Infosec","COG",0,0,true),
          new Skill("Interface","COG",0,0,true),
          new Skill("Kinesics","SAV",0,0,true),
          new Skill("Melee","SOM",0,0,true),
          new Skill("Perceive","INT",0,0,true),
          new Skill("Persuade","SAV",0,0,true),
          new Skill("Program","COG",0,0,true),
          new Skill("Provoke","SAV",0,0,true),
          new Skill("Psi","WIL",0,0,true),
          new Skill("Research","COG",0,0,true),
          new Skill("Survival","INT",0,0,true),
          new Skill("Hardware: ?","COG",0,0,false),
          new Skill("Medicine: ?","COG",0,0,false),
          new Skill("Pilot: ?","REF",0,0,false),
          new Skill("Know: ?","?",0,0,false)
          ];
        },
        default_muse(){
          this.character.muse.skills = [
          new Skill("Hardware: Electronics","COG",30,0,true),
          new Skill("Infosec","COG",30,0,true),
          new Skill("Interface","COG",60,0,true),
          new Skill("Know: Accounting","COG",60,0,true),
          new Skill("Know: Psychology","COG",60,0,true),
          new Skill("Medicine: Psychosurgery","COG",30,0,true),
          new Skill("Perceive","INT",30,0,true),
          new Skill("Program","COG",30,0,true),
          new Skill("Research","COG",30,0,true),
          new Skill("Know: ?","?",40,0,false),
          ]
        },
        defaults(){
          this.character = new Character();
          this.default_skills();
          this.default_muse();
          character_loaded = this.character; //Global reference so we can play with it.
        },
        show_wipe_dialog(){
          $('#character-wipe').modal('show');
        },
        wipe(){
          this.defaults();
          $('#character-wipe').modal('hide');
          var browserStore = window.localStorage;
          browserStore.clear();
        },
        update_export(){
          var preparing = $.extend(true,{},serial_character);
          export_properties(this.character,preparing,serial_character);
          var uncomp = JSON.stringify(preparing);
          this.base64export = LZString.compressToBase64(uncomp);
        },
        export_character(){
          this.update_export();
          $('#export-modal').modal('show');
        },
        import_character(val){
          let base64 = val || $("#import-textarea").val();
          let decomp = JSON.parse(LZString.decompressFromBase64(base64));
          import_properties(decomp,this.character,serial_character);
          $("#import-modal").modal('hide');
        },
        show_import_dialog(){
          $("#import-modal").modal('show');
        },
        copy_export(){
          $("#export-textarea").focus().select();
          try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log("Copying export was " + msg);
          } catch (err) {
            console.log("Couldn't copy export due to exception");
          }
        },
        save_character(){
          this.update_export();
          var browserStore = window.localStorage;
          browserStore.setItem('ep2character', this.base64export);
          $('body')
            .toast({
              title: 'Saved Character',
              message: "You should occasionally back up your data via 'Export' also.",
              displayTime: 7000,
              showProgress: "bottom"
            });
        },
        load_from_localstorage(){
          var browserStore = window.localStorage;
          var save = browserStore.getItem('ep2character');
          if(save){
            this.import_character(save);
            return true;
          }
          return false;
        },
        show_rolls(){
          $("#sheet-rolls").modal('show');
        },
        custom_roll(){
          let reasonval = $("#custom-reason").val();
          if(reasonval){
            reasonval += " (Custom)";
          }
          this.roll($("#custom-target").val(),reasonval||"Custom Roll");
        }
      },
      computed: {
        reverse_rolls(){
          return this.rolls.slice().reverse();
        }
      },
      created: function (){
        if(!this.character){
          this.defaults();
        }
        this.load_from_localstorage();
      },
      mounted: function (){
        $(this.$el).on("click",".clickedit, .selectable",function(event){
          $(event.currentTarget).find(".prop[contentEditable=true]").first().focus();
        });
      },
      template: templateHtml
    };
  });
};


const vr_chargen = function() {
  return $.ajax("static/chargen.html").then(function(templateHtml) {
    return {
      template: templateHtml,
      data: function() {
        return {
          chargen: [],
          backgrounds,
          careers,
          interests,
          factions,
          aptemps,
          reputations,
          gearpacks,
          skills
        };
      },
      watch: {
        '$route' (to, from) {
          // Handle the showing & hiding of the target segment!
          $(this.$el).find("#chargen-" + from.params.step).removeClass("active");
          $(this.$el).find("#chargen-" + to.params.step).addClass("active");
          $(".sticky", this.$el).sticky('refresh');
        }
      },
      updated: function () {
        $(this.$el).find('table').tablesort();
      },
      mounted: function(){
        // Tabs are already hard coded in the template, we'e good to initialize tabs
        $(this.$el).find("#chargen-" + this.$route.params.step).addClass("active");
        
        // When all data is loaded, the active tab will be at proper height and we can refresh sticky.
        Promise.all([
          $.getJSON('data/chargen_custom.json').then((json) => {this.chargen = json;}),
        ]).then(() => {
          Vue.nextTick(() => {
            $(".sticky", this.$el).sticky();
          });
        });
      }
    };
  });
}

const vr_morphs = {
  data: function () {
    return {
      morphs,
      morph_types
    };
  },
  props: {
    morphtype: String
  },
  template: `
  <div class="ui segment inverted">
    <div id="morph-grid" class="ui grid">
      <div class="two wide column">
        <div id="morph-tabs" class="ui vertical sticky fluid tabular menu inverted">
          <router-link class="item" to="biomorph">Biomorphs</router-link>
          <router-link class="item" to="pod">Pod Biomorphs</router-link>
          <router-link class="item" to="uplift">Uplift Biomorhs</router-link>
          <router-link class="item" to="synthmorph">Synthmorphs</router-link>
          <router-link class="item" to="infomorph">Infomorphs</router-link>
          <router-link class="item" to="flexbot">Flexbots</router-link>
        </div>
      </div>
      <div class="fourteen wide stretched column">
      	<vcomp-typecard :mymorphs="current_morphs" :mytype_obj="current_typeobj" mytype=""></vcomp-typecard>
      </div>
    </div>
  </div>
  `,
  mounted: function() {
    $('.item', this.$el).tab({
        onVisible: function(){
          $(".sticky", this.$el).sticky('refresh');
        }
    });
  },
  computed: {
    current_morphs: function () {
      switch(this.morphtype){
        case "biomorph":
          return this.biomorphs;
        case "pod":
          return this.pod_biomorphs;
        case "uplift":
          return this.uplift_biomorphs;
        case "synthmorph":
          return this.synthmorphs;
        case "infomorph":
          return this.infomorphs;
        case "flexbot":
          return this.flexbot_parts;
        default:
          return [];
      }
    },
    current_typeobj: function() {
      let capsname = this.morphtype.charAt(0).toUpperCase() + this.morphtype.slice(1);
      return this.morph_types.find((element) => {
        return element.name == capsname;
      });
    },
    biomorphs: function () {
      return this.morphs.filter(function(element){
        if(element.type == "Biomorph"){return true;}
      });
    },
    pod_biomorphs: function () {
      return this.morphs.filter(function(element){
        if(element.type == "Pod"){return true;}
      });
    },
    uplift_biomorphs: function () {
      return this.morphs.filter(function(element){
        if(element.type == "Uplift"){return true;}
      });
    },
    synthmorphs: function () {
      return this.morphs.filter(function(element){
        if(element.type == "Synthmorph"){return true;}
      });
    },
    infomorphs: function () {
      return this.morphs.filter(function(element){
        if(element.type == "Infomorph"){return true;}
      });
    },
    flexbot_parts: function () {
      return this.morphs.filter(function(element){
        if(element.type == "Flexbot"){return true;}
      });
    }
  }
}

const vr_gear = {
  data: function() {
    return {
      unsorted_gear, //This is a global so we can use it other places too.
      gear_types: {}
    };
  },
  props: {
  	category: String,
  	subcategory: String
  },
  template: `
  <div class="ui segment inverted">
    <div id="gear-grid" class="ui grid">
      <div class="two wide column">
        <div id="gear-tabs" class="ui vertical sticky fluid tabular menu inverted">
          <template v-for="(catobj,catname) in categories">
          	<router-link class="item" :to="'/gear/'+catname">
		          {{catname}}
		          <div class="menu">
			          <div class="ui divider"></div>
			          <router-link v-for="(thekey,subcatname) in catobj.subcategories" class="item" :to="'/gear/'+catname+'/'+despace(subcatname)" v-on:click.stop style="text-align: right;" :key="'link'+catname+subcatname">{{subcatname}}</router-link>
		          </div>
	          </router-link>
          </template>
        </div>
      </div>
      <div class="fourteen wide stretched column">
        <vcomp-gear-section v-if="current_category" :category="current_category" :categoryname="current_catname" :key="current_catname"></vcomp-gear-section>
      </div>
    </div>
  </div>
  `,
  created: function() {
    $.getJSON('data/gear_categories.json').then( (json) => {
      this.gear_types = json;
    });
  },
  mounted: function() {
      this.$nextTick(function (){
        $(".sticky", this.$el).sticky('refresh');
      });
  },
  watch: {
    '$route' (to, from) {
      this.$nextTick(function (){
        $(".sticky", this.$el).sticky('refresh');
      });
    }
  },
  methods: {
  	despace: function(value) {
  		return global_despace(value);
  	}
  },
  computed: {
  	current_category: function() {
  		return this.categories[this.category];
  	},
  	current_catname: function() {
  		//So, a user could just put whatever they want in this and it would get put somewhere, maybe vulnerable to attack?
  		//But presumably if we actually found the real category with this in the real json on our site, then it's
  		//probably not any kind of badness.
  		if(this.category in this.categories){
  			return this.category;
  		}
  	},
    categories: function() {
      let new_cats = {};

      //Iterate over what should be a rapidly shrinking list
      this.unsorted_gear.forEach(function(item_object){
        //What category is our contender?
        let category = item_object.category;
        
        //We already have that one though
        if(category in new_cats){return;}
        
        //Make our new object
        let new_category = {
          "text":"",
          "subcategories":{}
        };

        //Grab the text if it exists
        if(category in this.gear_types){
          if('text' in this.gear_types[category]){
            new_category.text = this.gear_types[category]['text'];
          }
        }
        
        //Get all my items
        let this_category = this.unsorted_gear.filter(function(maybe_mine,index){
            return maybe_mine.category == category;
        },this);

        //I wish I had subcategories
        this_category.forEach(function(my_item){
          let subcategory = my_item.subcategory;
          
          //Oh you already know I exist okay then
          if(subcategory in new_category.subcategories){
            new_category['subcategories'][subcategory].items.push(my_item);
            return; //Ok added bye
          }
          
          //Oh a first timer
          let new_subcategory = {
            "text":"",
            "items":[],
            "columns":["name"]
          };
          new_subcategory.items.push(my_item); //Hi I'm the first
          
          //Grab the text if it exists
          if(category in this.gear_types){
            if(subcategory in this.gear_types[category]['subcategories']){
              if('text' in this.gear_types[category]['subcategories'][subcategory]){
                new_subcategory.text = this.gear_types[category]['subcategories'][subcategory]['text'];
              }
            }
          }

          //Surely there's a better way...
          if(category in this.gear_types){
            if(subcategory in this.gear_types[category]['subcategories']){
              if('columns' in this.gear_types[category]['subcategories'][subcategory]){
                new_subcategory.columns = this.gear_types[category]['subcategories'][subcategory]['columns'];
              }
            }
          }

          new_category['subcategories'][subcategory] = new_subcategory;
        },this);
        new_cats[category] = new_category;
      },this);
      //Done!
      return new_cats;
    }
  }
}

const vr_traits = {
  data: function() {
    return {
      traits
    };
  },
  props: {
    tabid: String
  },
  template: `
  <div class="ui segment inverted">  
    <div id="traits-grid" class="ui grid">
      <div class="two wide column">
        <div id="traits-tabs" class="ui vertical sticky fluid tabular menu inverted">
        <router-link class="item" to="positive">Positive</router-link>
        <router-link class="item" to="negative">Negative</router-link>
        </div>
      </div>
      <div class="fourteen wide stretched column">
      <div class="ui segment inverted">
        <vcomp-trait-table :traits="current_traits"></vcomp-trait-table>
      </div>
      </div>
    </div>
  </div>
  `,
  mounted: function() {
    $('.item', this.$el).tab({
        onVisible: function(){
          $(".sticky", this.$el).sticky('refresh');
        }
    });
  },  
  computed: {
    current_traits: function () {
      switch(this.tabid){
        case "positive":
          return this.traits_positive;
        case "negative":
          return this.traits_negative;
        default:
          return [];
      }
    },
    traits_positive: function () {
        return this.traits.filter(function(element){
          if(element.type == "Positive"){return true;}
        });
    },
    traits_negative: function () {
        return this.traits.filter(function(element){
          if(element.type == "Negative"){return true;}
        });
    }
  }
}

const vr_sleights = {
  data: function() {
    return {
      sleights
    };
  },
  props: {
    tabid: String
  },
  template: `
  <div class="ui segment inverted">  
    <vcomp-sleight-table :sleights="sleights"></vcomp-sleight-table>
  </div>
  `
}

const vr_primer = function() {
  return $.ajax("static/primer.html").then(function(templateHtml) {
    return {
      template: templateHtml,
      methods: {
        or_list: function (arr) {
        return arr.join(", ").replace(/, ((?:.(?!, ))+)$/, ', or $1');
        }
      },
      watch: {
        '$route' (to, from) {
          // Handle the showing & hiding of the target segment!
          $(this.$el).find("#primer-" + from.params.step).removeClass("active");
          $(this.$el).find("#primer-" + to.params.step).addClass("active");
          $(".sticky", this.$el).sticky('refresh');
        }
      },
      mounted: function(){
        // Tabs are already hard coded in the template, we'e good to initialize tabs
        $(this.$el).find("#primer-" + this.$route.params.step).addClass("active");
      }
    }
  });
}

const vr_routes = [
  { path: '/quickrules', component: vr_quickrules },
  { path: '/sheet', component: vr_sheet },
  { path: '/chargen', redirect: '/chargen/1' },
  { path: '/chargen/:step', component: vr_chargen },
  { path: '/primer', redirect: '/primer/whatis' },
  { path: '/primer/:step', component: vr_primer },
  { path: '/morphs/:morphtype', component: vr_morphs, props: true },
  { path: '/morphs', redirect: '/morphs/biomorph' },
  { path: '/gear/:category/:subcategory', component: vr_gear, props: true },
  { path: '/gear/:category', component: vr_gear, props: true },
  { path: '/gear', component: vr_gear },
  { path: '/traits/:tabid', component: vr_traits, props: true},
  { path: '/traits', redirect: "/traits/positive" },
  { path: '/sleights', component: vr_sleights, props: true},
  { path: '*', redirect: '/quickrules' }
]

const vr_router = new VueRouter({
  routes: vr_routes,
  linkActiveClass: "active",
  scrollBehavior (to, from, savedPosition) {
  	let scrollables = ["subcategory"];
  	if(savedPosition) {
  		return savedPosition;
  	}

  	for(key in to.params){
  		if(scrollables.indexOf(key) > -1){
  			let rawid = to.params[key];
  			let cleanid = "#"+global_despace(rawid);
  			return {selector: cleanid};
  		}
  	}

  }
})
