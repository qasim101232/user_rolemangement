import React, { useEffect, useMemo, useRef, useState } from 'react';

type Option = {
  value: string | number;
  label: string;
};

type Props = {
  options: Option[];
  value: string | number | '';
  onChange: (value: string | number) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
};

const SearchableDropdown: React.FC<Props> = ({
  options,
  value,
  onChange,
  label,
  placeholder = 'Choose...',
  required,
  error
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const selectedOption = useMemo(() => {
    return options.find((o) => String(o.value) === String(value)) || null;
  }, [options, value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const onPick = (opt: Option) => {
    onChange(opt.value);
    setOpen(false);
  };

  return (
    <div className="searchable-dropdown" ref={rootRef}>
      {label && (
        <label>
          {label} {required && <span className="required">*</span>}
        </label>
      )}

      <div
        className={`dropdown-input ${open ? 'focused' : ''} ${error ? 'error' : ''}`}
        onClick={() => setOpen((v) => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setOpen((v) => !v);
        }}
      >
        <input
          ref={inputRef}
          value={open ? query : selectedOption?.label || ''}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={open ? 'Search...' : placeholder}
          readOnly={!open}
          aria-expanded={open}
        />
        <div className={`dropdown-arrow ${open ? 'open' : ''}`}>▾</div>
      </div>

      {error && <div className="dropdown-error">{error}</div>}

      {open && (
        <ul className="dropdown-list">
          {filtered.length === 0 ? (
            <li className="no-results">No results</li>
          ) : (
            filtered.map((opt) => {
              const selected = String(opt.value) === String(value);
              return (
                <li
                  key={String(opt.value)}
                  className={selected ? 'selected' : ''}
                  onClick={() => onPick(opt)}
                >
                  <span>{opt.label}</span>
                  {selected ? <span className="check-mark">✓</span> : <span />}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
};

export default SearchableDropdown;

