export const fadeInStyle = `
  opacity: 0;
  transform: translateY(30px) scale(0.97);
  transition: opacity 0.9s ease-out, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
  &[data-visible='true'] {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;