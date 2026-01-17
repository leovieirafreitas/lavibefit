"use client";

import { Instagram, Facebook, Phone, Mail, Globe, ShieldCheck, CreditCard, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-black text-white pt-16 pb-10 border-t border-gray-900">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">

                    {/* Coluna 1: Navegação e Segurança */}
                    <div className="space-y-8">
                        <div>
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Navegação</h4>
                            <ul className="space-y-2 text-sm font-medium text-gray-300">
                                <li><Link href="/" className="hover:text-[#DD3468] transition-colors">Página Inicial</Link></li>
                                <li><Link href="/lancamentos" className="hover:text-[#DD3468] transition-colors">Lançamentos</Link></li>
                                <li><Link href="/feminino/conjuntos" className="hover:text-[#DD3468] transition-colors">Conjuntos</Link></li>
                            </ul>
                        </div>

                        <div className="flex items-center gap-3 text-green-500">
                            <ShieldCheck className="w-10 h-10" />
                            <div>
                                <p className="text-xs font-bold uppercase text-green-500">Site 100%</p>
                                <p className="text-lg font-black uppercase text-green-500 leading-none">SEGURO</p>
                                <p className="text-[10px] text-gray-500">Certificado SSL</p>
                            </div>
                        </div>
                    </div>

                    {/* Coluna 2: Atendimento */}
                    <div className="space-y-8">
                        <div>
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Fale com o vendedor</h4>
                            <a
                                href="https://wa.me/559284665689"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-[#25D366] hover:text-white transition-colors font-bold text-lg"
                            >
                                <MessageCircle className="w-6 h-6" />
                                <span>LA VIBE FIT</span>
                            </a>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Atendimento ao cliente</h4>
                            <ul className="space-y-3 text-sm text-gray-300">
                                <li className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-[#DD3468]" />
                                    <span>(92) 8466-5689</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-[#DD3468]" />
                                    <span>contato@lavibefit.com.br</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Globe className="w-4 h-4 text-[#DD3468]" />
                                    <span>www.lavibefit.com.br</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Coluna 3: Pagamento e Redes Sociais */}
                    <div className="space-y-8">
                        <div>
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Formas de pagamento aceitas</h4>
                            <div className="flex gap-4 items-center">
                                <img src="/caartao.png" alt="Cartão" className="h-6 w-auto brightness-0 invert" />
                                <img src="/pix.png" alt="Pix" className="h-6 w-auto" />
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Nos siga nas redes sociais</h4>
                            <div className="flex gap-4">
                                <a
                                    href="https://www.instagram.com/lavibefit/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 bg-[#DD3468] rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                                >
                                    <Instagram className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="border-t border-gray-900 pt-8 text-center text-gray-600 text-xs font-medium uppercase tracking-wide">
                    © 2026 La Vibi Fit. Todos os direitos reservados.
                </div>
            </div>
        </footer>
    );
}
