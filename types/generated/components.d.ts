import type { Schema, Struct } from '@strapi/strapi';

export interface ProgramsInformation extends Struct.ComponentSchema {
  collectionName: 'components_programs_information';
  info: {
    description: '';
    displayName: 'information';
  };
  attributes: {
    date_CN: Schema.Attribute.String;
    date_EN: Schema.Attribute.String;
    date_HK: Schema.Attribute.String;
    dates: Schema.Attribute.Component<'programs.program-date', true>;
    displayDate_CN: Schema.Attribute.String;
    displayDate_EN: Schema.Attribute.String;
    displayDate_HK: Schema.Attribute.String;
    files_CN: Schema.Attribute.RichText;
    files_EN: Schema.Attribute.RichText;
    files_HK: Schema.Attribute.RichText;
    formPrefixCN: Schema.Attribute.RichText;
    formPrefixEN: Schema.Attribute.RichText;
    formPrefixHK: Schema.Attribute.RichText;
    formSuffixCN: Schema.Attribute.RichText;
    formSuffixEN: Schema.Attribute.RichText;
    formSuffixHK: Schema.Attribute.RichText;
    language_CN: Schema.Attribute.String;
    language_EN: Schema.Attribute.String;
    language_HK: Schema.Attribute.String;
    location_CN: Schema.Attribute.RichText;
    location_EN: Schema.Attribute.RichText;
    location_HK: Schema.Attribute.RichText;
    meet_session_CN: Schema.Attribute.String;
    meet_session_EN: Schema.Attribute.String;
    meet_session_HK: Schema.Attribute.String;
    preview_only: Schema.Attribute.Boolean;
    registerEmail: Schema.Attribute.RichText;
    registerEmailTitle: Schema.Attribute.String;
    remark_CN: Schema.Attribute.RichText;
    remark_EN: Schema.Attribute.RichText;
    remark_HK: Schema.Attribute.RichText;
    sheetId: Schema.Attribute.String;
    sitLimit: Schema.Attribute.Integer;
    sitRegistered: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    ticket_CN: Schema.Attribute.RichText;
    ticket_EN: Schema.Attribute.RichText;
    ticket_HK: Schema.Attribute.RichText;
    tittle_CN: Schema.Attribute.String;
    tittle_EN: Schema.Attribute.String;
    tittle_HK: Schema.Attribute.String;
  };
}

export interface ProgramsProgram extends Struct.ComponentSchema {
  collectionName: 'components_programs_programs';
  info: {
    description: '';
    displayName: 'program';
    icon: 'apps';
  };
  attributes: {
    category: Schema.Attribute.Enumeration<['other', 'workshop', 'lecture']> &
      Schema.Attribute.DefaultTo<'other'>;
    ccEmail: Schema.Attribute.String;
    content_CN: Schema.Attribute.RichText;
    content_EN: Schema.Attribute.RichText;
    content_HK: Schema.Attribute.RichText;
    dates: Schema.Attribute.Component<'programs.program-date', true>;
    displayDate_CN: Schema.Attribute.String;
    displayDate_EN: Schema.Attribute.String;
    displayDate_HK: Schema.Attribute.String;
    displayTime_CN: Schema.Attribute.String;
    displayTime_EN: Schema.Attribute.String;
    displayTime_HK: Schema.Attribute.String;
    feature: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    formPrefixCN: Schema.Attribute.RichText;
    formPrefixEN: Schema.Attribute.RichText;
    formPrefixHK: Schema.Attribute.RichText;
    formSuffixCN: Schema.Attribute.RichText;
    formSuffixEN: Schema.Attribute.RichText;
    formSuffixHK: Schema.Attribute.RichText;
    google_sheet_id: Schema.Attribute.String;
    preview_only: Schema.Attribute.Boolean;
    registerEmail: Schema.Attribute.RichText;
    registerEmailTitle: Schema.Attribute.String;
    registerForm: Schema.Attribute.Component<'programs.register-form', true>;
    sheetId: Schema.Attribute.String;
    sitLimit: Schema.Attribute.Integer;
    sitRegistered: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    title_CN: Schema.Attribute.String;
    title_EN: Schema.Attribute.String;
    title_HK: Schema.Attribute.String;
  };
}

export interface ProgramsProgramDate extends Struct.ComponentSchema {
  collectionName: 'components_programs_program_dates';
  info: {
    description: '';
    displayName: 'programDate';
  };
  attributes: {
    date: Schema.Attribute.Date;
    time: Schema.Attribute.Time;
  };
}

export interface ProgramsRegisterForm extends Struct.ComponentSchema {
  collectionName: 'components_programs_register_forms';
  info: {
    description: '';
    displayName: 'registerForm';
    icon: 'attachment';
  };
  attributes: {
    formPrefixCN: Schema.Attribute.RichText;
    formPrefixEN: Schema.Attribute.RichText;
    formPrefixHK: Schema.Attribute.RichText;
    formSuffixCN: Schema.Attribute.RichText;
    formSuffixEN: Schema.Attribute.RichText;
    formSuffixHK: Schema.Attribute.RichText;
    registerEmail: Schema.Attribute.RichText;
    registerEmailTitle: Schema.Attribute.String;
    sheetId: Schema.Attribute.String;
    sitLimit: Schema.Attribute.Integer;
    sitRegistered: Schema.Attribute.Integer;
    submitTextCN: Schema.Attribute.String;
    submitTextEN: Schema.Attribute.String;
    submitTextHK: Schema.Attribute.String;
  };
}

export interface UiDownload extends Struct.ComponentSchema {
  collectionName: 'components_ui_downloads';
  info: {
    description: '';
    displayName: 'download';
  };
  attributes: {
    file: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    thumbnail: Schema.Attribute.Media<'images'>;
    title_CN: Schema.Attribute.String;
    title_EN: Schema.Attribute.String;
    title_HK: Schema.Attribute.String;
  };
}

export interface UiLogos extends Struct.ComponentSchema {
  collectionName: 'components_ui_logos';
  info: {
    description: '';
    displayName: 'logos';
  };
  attributes: {
    img: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    img_CN: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    img_HK: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    label: Schema.Attribute.String;
    url_CN: Schema.Attribute.String;
    url_EN: Schema.Attribute.String;
    url_HK: Schema.Attribute.String;
  };
}

export interface UiMenuItem extends Struct.ComponentSchema {
  collectionName: 'components_ui_menu_items';
  info: {
    description: '';
    displayName: 'menu_item';
    icon: 'bulletList';
  };
  attributes: {
    blank: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    hideInMobile: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    label_CN: Schema.Attribute.String;
    label_EN: Schema.Attribute.String;
    label_HK: Schema.Attribute.String;
    show: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    show_in_desktop: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    subMenu: Schema.Attribute.Component<'ui.sub-menu', true>;
    url_CN: Schema.Attribute.String;
    url_EN: Schema.Attribute.String;
    url_HK: Schema.Attribute.String;
  };
}

export interface UiPopup extends Struct.ComponentSchema {
  collectionName: 'components_ui_popups';
  info: {
    description: '';
    displayName: 'popup';
    icon: 'archive';
  };
  attributes: {
    alway_show: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    content_CN: Schema.Attribute.RichText;
    content_EN: Schema.Attribute.RichText;
    content_HK: Schema.Attribute.RichText;
    enable: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    once: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
  };
}

export interface UiSectoin extends Struct.ComponentSchema {
  collectionName: 'components_ui_sectoins';
  info: {
    description: '';
    displayName: 'sectoin';
  };
  attributes: {
    content_CN: Schema.Attribute.RichText;
    content_EN: Schema.Attribute.RichText;
    content_HK: Schema.Attribute.RichText;
    event: Schema.Attribute.Relation<'oneToOne', 'api::event.event'>;
    files: Schema.Attribute.Component<'ui.download', true>;
    preview_only: Schema.Attribute.Boolean;
    redirect_url: Schema.Attribute.String;
    show: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    title_CN: Schema.Attribute.String;
    title_EN: Schema.Attribute.String;
    title_HK: Schema.Attribute.String;
  };
}

export interface UiSlide extends Struct.ComponentSchema {
  collectionName: 'components_ui_slides';
  info: {
    description: '';
    displayName: 'Slide';
    icon: 'apps';
  };
  attributes: {
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    link_CN: Schema.Attribute.String;
    link_EN: Schema.Attribute.String;
    link_HK: Schema.Attribute.String;
    thumbnail: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    title_CN: Schema.Attribute.String;
    title_EN: Schema.Attribute.Text;
    title_HK: Schema.Attribute.String;
    video_EN: Schema.Attribute.String;
    video_HK: Schema.Attribute.String;
    video_ZH: Schema.Attribute.String;
  };
}

export interface UiSocial extends Struct.ComponentSchema {
  collectionName: 'components_ui_socials';
  info: {
    displayName: 'social';
    icon: 'alien';
  };
  attributes: {
    icon: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    label: Schema.Attribute.String;
    link: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface UiSubMenu extends Struct.ComponentSchema {
  collectionName: 'components_ui_sub_menus';
  info: {
    description: '';
    displayName: 'subMenu';
    icon: 'bulletList';
  };
  attributes: {
    blank: Schema.Attribute.Boolean;
    label_CN: Schema.Attribute.String;
    label_EN: Schema.Attribute.String;
    label_HK: Schema.Attribute.String;
    show: Schema.Attribute.Boolean;
    show_in_desktop: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    url: Schema.Attribute.String;
    url_CN: Schema.Attribute.String;
    url_EN: Schema.Attribute.String;
    url_HK: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'programs.information': ProgramsInformation;
      'programs.program': ProgramsProgram;
      'programs.program-date': ProgramsProgramDate;
      'programs.register-form': ProgramsRegisterForm;
      'ui.download': UiDownload;
      'ui.logos': UiLogos;
      'ui.menu-item': UiMenuItem;
      'ui.popup': UiPopup;
      'ui.sectoin': UiSectoin;
      'ui.slide': UiSlide;
      'ui.social': UiSocial;
      'ui.sub-menu': UiSubMenu;
    }
  }
}
