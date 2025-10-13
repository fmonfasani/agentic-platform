import { render, screen } from '@testing-library/react';
import Home from '../../web/src/app/dashboard/page';

describe('Página principal', () => {
  it('✅ muestra el título esperado', () => {
    render(<Home />);
    const heading = screen.getByRole('heading', { name: /Agentic Platform/i });
    expect(heading).toBeInTheDocument();
  });
});
