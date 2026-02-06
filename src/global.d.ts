// Объявление типов для всех модулей SCSS
declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

// Если используете обычные CSS файлы тоже
declare module '*.scss' {
  const content: string;
  export default content;
}