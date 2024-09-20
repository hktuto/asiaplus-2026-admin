import type { Schema, Attribute } from '@strapi/strapi';

export interface ProgramsInformation extends Schema.Component {
  collectionName: 'components_programs_information';
  info: {
    displayName: 'information';
    description: '';
  };
  attributes: {
    date_HK: Attribute.String;
    date_EN: Attribute.String;
    date_CN: Attribute.String;
    location_HK: Attribute.RichText;
    location_EN: Attribute.RichText;
    location_CN: Attribute.RichText;
    ticket_HK: Attribute.RichText;
    ticket_EN: Attribute.RichText;
    ticket_CN: Attribute.RichText;
    language_HK: Attribute.String;
    language_EN: Attribute.String;
    language_CN: Attribute.String;
    meet_session_HK: Attribute.String;
    meet_session_EN: Attribute.String;
    meet_session_CN: Attribute.String;
    remark_HK: Attribute.RichText;
    remark_EN: Attribute.RichText;
    remark_CN: Attribute.RichText;
    tittle_HK: Attribute.String;
    tittle_EN: Attribute.String;
    tittle_CN: Attribute.String;
    dates: Attribute.Component<'programs.program-date', true>;
    sheetId: Attribute.String;
    registerEmail: Attribute.RichText;
    formPrefixHK: Attribute.RichText;
    formPrefixEN: Attribute.RichText;
    formPrefixCN: Attribute.RichText;
    formSuffixHK: Attribute.RichText;
    formSuffixEN: Attribute.RichText;
    formSuffixCN: Attribute.RichText;
    sitLimit: Attribute.Integer;
    registerEmailTitle: Attribute.String;
    sitRegistered: Attribute.Integer & Attribute.DefaultTo<0>;
    displayDate_HK: Attribute.String;
    displayDate_EN: Attribute.String;
    displayDate_CN: Attribute.String;
  };
}

export interface ProgramsProgramDate extends Schema.Component {
  collectionName: 'components_programs_program_dates';
  info: {
    displayName: 'programDate';
    description: '';
  };
  attributes: {
    date: Attribute.Date;
    time: Attribute.Time;
  };
}

export interface ProgramsProgram extends Schema.Component {
  collectionName: 'components_programs_programs';
  info: {
    displayName: 'program';
    icon: 'apps';
    description: '';
  };
  attributes: {
    title_HK: Attribute.String;
    title_EN: Attribute.String;
    title_CN: Attribute.String;
    content_HK: Attribute.RichText;
    content_EN: Attribute.RichText;
    content_CN: Attribute.RichText;
    google_sheet_id: Attribute.String;
    displayTime_HK: Attribute.String;
    displayTime_EN: Attribute.String;
    displayTime_CN: Attribute.String;
    dates: Attribute.Component<'programs.program-date', true>;
    sheetId: Attribute.String;
    registerEmail: Attribute.RichText;
    formPrefixHK: Attribute.RichText;
    formPrefixEN: Attribute.RichText;
    formPrefixCN: Attribute.RichText;
    formSuffixHK: Attribute.RichText;
    formSuffixCN: Attribute.RichText;
    formSuffixEN: Attribute.RichText;
    sitLimit: Attribute.Integer;
    registerEmailTitle: Attribute.String;
    sitRegistered: Attribute.Integer & Attribute.DefaultTo<0>;
    displayDate_HK: Attribute.String;
    displayDate_EN: Attribute.String;
    displayDate_CN: Attribute.String;
  };
}

export interface UiDownload extends Schema.Component {
  collectionName: 'components_ui_downloads';
  info: {
    displayName: 'download';
    description: '';
  };
  attributes: {
    title_HK: Attribute.String;
    title_EN: Attribute.String;
    title_CN: Attribute.String;
    file: Attribute.Media;
    thumbnail: Attribute.Media;
  };
}

export interface UiLogos extends Schema.Component {
  collectionName: 'components_ui_logos';
  info: {
    displayName: 'logos';
    description: '';
  };
  attributes: {
    label: Attribute.String;
    img: Attribute.Media;
    url_HK: Attribute.String;
    url_EN: Attribute.String;
    url_CN: Attribute.String;
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
    blank: Attribute.Boolean & Attribute.DefaultTo<false>;
    show: Attribute.Boolean & Attribute.DefaultTo<true>;
    label_HK: Attribute.String;
    subMenu: Attribute.Component<'ui.sub-menu', true>;
    label_CN: Attribute.String;
    show_in_desktop: Attribute.Boolean & Attribute.DefaultTo<true>;
    url_HK: Attribute.String;
    url_EN: Attribute.String;
    url_CN: Attribute.String;
  };
}

export interface UiSectoin extends Schema.Component {
  collectionName: 'components_ui_sectoins';
  info: {
    displayName: 'sectoin';
    description: '';
  };
  attributes: {
    title_HK: Attribute.String;
    title_EN: Attribute.String;
    title_CN: Attribute.String;
    files: Attribute.Component<'ui.download', true>;
    content_HK: Attribute.RichText;
    content_EN: Attribute.RichText;
    content_CN: Attribute.RichText;
    event: Attribute.Relation<'ui.sectoin', 'oneToOne', 'api::event.event'>;
    redirect_url: Attribute.String;
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
    video_EN: Attribute.String;
    image: Attribute.Media;
    title_CN: Attribute.String;
    title_EN: Attribute.Text;
    title_HK: Attribute.String;
    video_HK: Attribute.String;
    video_ZH: Attribute.String;
    thumbnail: Attribute.Media;
    link_HK: Attribute.String;
    link_EN: Attribute.String;
    link_CN: Attribute.String;
  };
}

export interface UiSocial extends Schema.Component {
  collectionName: 'components_ui_socials';
  info: {
    displayName: 'social';
    icon: 'alien';
  };
  attributes: {
    label: Attribute.String;
    icon: Attribute.Media & Attribute.Required;
    link: Attribute.String & Attribute.Required;
  };
}

export interface UiSubMenu extends Schema.Component {
  collectionName: 'components_ui_sub_menus';
  info: {
    displayName: 'subMenu';
    icon: 'bulletList';
    description: '';
  };
  attributes: {
    label_EN: Attribute.String;
    label_HK: Attribute.String;
    blank: Attribute.Boolean;
    show: Attribute.Boolean;
    url: Attribute.String;
    label_CN: Attribute.String;
    show_in_desktop: Attribute.Boolean & Attribute.DefaultTo<true>;
    url_HK: Attribute.String;
    url_EN: Attribute.String;
    url_CN: Attribute.String;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'programs.information': ProgramsInformation;
      'programs.program-date': ProgramsProgramDate;
      'programs.program': ProgramsProgram;
      'ui.download': UiDownload;
      'ui.logos': UiLogos;
      'ui.menu-item': UiMenuItem;
      'ui.sectoin': UiSectoin;
      'ui.slide': UiSlide;
      'ui.social': UiSocial;
      'ui.sub-menu': UiSubMenu;
    }
  }
}
