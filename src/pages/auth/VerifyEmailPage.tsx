import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, ArrowRight, Loader2 } from 'lucide-react';
import { verifyEmail, resendVerificationCode } from '@/services/Auth/authService';

const VerifyEmailPage: React.FC = () => {
    const [otp, setOtp] = useState(['', '', '', '']);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendMessage, setResendMessage] = useState('');
    const inputRefs = useRef<Array<React.RefObject<HTMLInputElement>>>(
        Array(4)
            .fill(null)
            .map(() => React.createRef<HTMLInputElement>())
    );
    const navigate = useNavigate();
    const location = useLocation();

    // Retrieve email from navigation state
    const email = location.state?.email || '';

    useEffect(() => {
        if (!email) {
            // Redirect to register if no email is provided
            navigate('/register', { replace: true });
        }
    }, [email, navigate]);

    const handleOtpChange = (index: number, value: string) => {
        if (/^[0-9]?$/.test(value)) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);
            setError('');

            // Move to next input if value is entered
            if (value && index < 3) {
                inputRefs.current[index + 1].current?.focus();
            }
            // Move to previous input if value is cleared
            if (!value && index > 0) {
                inputRefs.current[index - 1].current?.focus();
            }
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
        if (pastedData.length <= 4) {
            const newOtp = [...otp];
            pastedData.split('').forEach((char, i) => {
                if (i < 4) newOtp[i] = char;
            });
            setOtp(newOtp);
            // Focus the last filled input or the next empty one
            const lastIndex = Math.min(pastedData.length, 3);
            inputRefs.current[lastIndex].current?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== 4 || !/^\d{4}$/.test(code)) {
            setError('Veuillez entrer un code à 4 chiffres.');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await verifyEmail({ email, verification_code:code });
            if (response.status === 'ok') {
                navigate('/dashboard');
            } else {
                throw new Error(response.message);
            }
        } catch (err: any) {
            setError(err.message || 'Échec de la vérification. Veuillez réessayer.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendCode = async () => {
        setIsResending(true);
        setResendMessage('');
        try {
            const response = await resendVerificationCode({ email });
            if (response.status === 'ok') {
                setResendMessage('Un nouveau code a été envoyé à votre adresse e-mail.');
            } else {
                throw new Error(response.message);
            }
        } catch (err: any) {
            setError(err.message || 'Échec de l’envoi du code. Veuillez réessayer.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-background p-4 sm:p-6 lg:p-8">
            <Card className="w-full max-w-md shadow-2xl overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, x: 300 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0.3, x: -300 }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                >
                    <CardHeader className="text-center">
                        <div className="flex justify-center items-center mb-6">
                            <MessageSquare className="h-12 w-12 text-primary" />
                            <span className="ml-3 text-4xl font-bold text-primary">Piperchat</span>
                        </div>
                        <CardTitle className="text-3xl font-semibold">Vérification de l’e-mail</CardTitle>
                        <CardDescription className="text-md text-muted-foreground pt-2">
                            Entrez le code à 4 chiffres envoyé à <span className="font-semibold">{email}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-4">
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <Label htmlFor="otp">Code de vérification</Label>
                                <div className="flex justify-between gap-2">
                                    {otp.map((digit, index) => (
                                        <Input
                                            key={index}
                                            ref={inputRefs.current[index]}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onPaste={handlePaste}
                                            className="w-12 h-12 text-center text-lg font-semibold"
                                            autoFocus={index === 0}
                                            required
                                        />
                                    ))}
                                </div>
                                {error && <p className="text-sm text-destructive mt-2">{error}</p>}
                                <Button type="submit" className="w-full mt-6" size="lg" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Vérification...
                                        </>
                                    ) : (
                                        <>
                                            Vérifier <ArrowRight className="h-5 w-5 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 text-center">
                        <Button
                            variant="link"
                            onClick={handleResendCode} // Fixed syntax
                            disabled={isSubmitting || isResending}
                            className="text-sm text-muted-foreground hover:text-primary"
                        >
                            {isResending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Envoi...
                                </>
                            ) : (
                                'Renvoyer le code'
                            )}
                        </Button>
                        {resendMessage && <p className="text-sm text-green-600">{resendMessage}</p>}
                        <p className="text-sm text-muted-foreground text-center">
                            Retour à{' '}
                            <Link to="/login" className="font-medium text-primary hover:underline">
                                Connexion
                            </Link>
                        </p>
                    </CardFooter>
                </motion.div>
            </Card>
            <Link to="/" className="mt-8 text-sm text-muted-foreground hover:text-primary transition-colors">
                ← Retour à l’accueil
            </Link>
        </div>
    );
};

export default VerifyEmailPage;