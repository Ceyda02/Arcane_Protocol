import bookIcon from '../../assets/icons/grimoire-book.png';

export default function PixelBookIcon({ className = '' }) {
  return <img className={`pixel-book-icon ${className}`} src={bookIcon} alt="" aria-hidden="true" />;
}
