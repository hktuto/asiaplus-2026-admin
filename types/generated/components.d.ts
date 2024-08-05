import type { Schema, Attribute } from '@strapi/strapi';

export interface ProgramsProgram extends Schema.Component {
  collectionName: 'components_programs_programs';
  info: {
    displayName: 'program';
    icon: 'apps';
    description: '';
  };
  attributes: {
    startDate: Attribute.Date;
    endDate: Attribute.Date;
    startTime: Attribute.Time;
    endTime: Attribute.Time;
    location_EN: Attribute.Text;
    location_HK: Attribute.Text;
    register_EN: Attribute.Text;
    register_HK: Attribute.Text;
    period_EN: Attribute.Text;
    period_HK: Attribute.Text;
    liveURL: Attribute.String;
    videoURL: Attribute.String;
    displayTime_EN: Attribute.String;
    displayTime_HK: Attribute.String;
    target_EN: Attribute.Text;
    target_HK: Attribute.Text;
    quota_EN: Attribute.Text;
    quota_HK: Attribute.Text;
    name_EN: Attribute.Text;
    name_HK: Attribute.String;
    district: Attribute.Relation<
      'programs.program',
      'oneToOne',
      'api::district.district'
    >;
    categories: Attribute.JSON &
      Attribute.CustomField<
        'plugin::multi-select.multi-select',
        [
          'World_Book_Day_Creative_Competition',
          'Chinese_Culture_Workshop',
          'Chinese_Culture_Activities',
          'Interactive Storytelling Device',
          'Traditional Performing Art',
          'Hong_Kong_Inter-School_Chinese_Reading_Final_Contest_cum_Award_Ceremony',
          'Read Together for Half an Hour',
          'Other Activities',
          'Handicraft Workshops',
          'Story Sharing Sessions',
          'Online_Reading_Club',
          'HKRW_Fun_Day',
          'HKRW_kick-off_ceremony_and_Carnival'
        ]
      >;
  };
}

export interface UiMenuItem extends Schema.Component {
  collectionName: 'components_ui_menu_items';
  info: {
    displayName: 'menu_item';
    icon: 'bulletList';
    description: '';
  };
  attributes: {
    label_EN: Attribute.String;
    url: Attribute.String & Attribute.DefaultTo<'#'>;
    blank: Attribute.Boolean & Attribute.DefaultTo<false>;
    show: Attribute.Boolean & Attribute.DefaultTo<true>;
    label_HK: Attribute.String;
    subMenu: Attribute.Component<'ui.sub-menu', true>;
  };
}

export interface UiSlide extends Schema.Component {
  collectionName: 'components_ui_slides';
  info: {
    displayName: 'Slide';
    icon: 'apps';
    description: '';
  };
  attributes: {
    url_EN: Attribute.String;
    image: Attribute.Media;
    title: Attribute.String;
    title_EN: Attribute.Text;
    title_HK: Attribute.String;
    url_HK: Attribute.String;
    url_ZH: Attribute.String;
    thumbnail: Attribute.Media;
  };
}

export interface UiSubMenu extends Schema.Component {
  collectionName: 'components_ui_sub_menus';
  info: {
    displayName: 'subMenu';
    icon: 'bulletList';
  };
  attributes: {
    label_EN: Attribute.String;
    label_HK: Attribute.String;
    blank: Attribute.Boolean;
    show: Attribute.Boolean;
    url: Attribute.String;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'programs.program': ProgramsProgram;
      'ui.menu-item': UiMenuItem;
      'ui.slide': UiSlide;
      'ui.sub-menu': UiSubMenu;
    }
  }
}
